import {
  BadRequestException,
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { AuthGuard, Roles } from '../auth/auth.guard';

const multer = require('multer');

const uploadRoot = join(process.cwd(), 'uploads');
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function sanitizeFolder(value: string | undefined) {
  const folder = (value || 'general').toLowerCase().replace(/[^a-z0-9-_]/g, '');
  return folder || 'general';
}

const uploadOptions = {
  storage: multer.diskStorage({
    destination: (req: any, _file: any, callback: (error: Error | null, destination: string) => void) => {
      const folder = sanitizeFolder(req.params?.folder);
      const destination = join(uploadRoot, folder);

      if (!existsSync(destination)) {
        mkdirSync(destination, { recursive: true });
      }

      callback(null, destination);
    },
    filename: (_req: any, file: any, callback: (error: Error | null, filename: string) => void) => {
      const extension = extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req: any, file: any, callback: (error: Error | null, acceptFile: boolean) => void) => {
    const extension = extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      callback(new BadRequestException('Only JPG, PNG, and WebP images are allowed'), false);
      return;
    }

    callback(null, true);
  },
};

@Controller('media')
@UseGuards(AuthGuard)
@Roles('ADMIN')
export class MediaController {
  @Post('upload/:folder')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  upload(@Param('folder') folder: string, @UploadedFile() file: any, @Req() request: any) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const safeFolder = sanitizeFolder(folder);
    const origin = `${request.protocol}://${request.get('host')}`;
    const url = `${origin}/uploads/${safeFolder}/${file.filename}`;

    return {
      url,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
