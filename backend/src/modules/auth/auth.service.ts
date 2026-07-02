import { ConflictException, Injectable, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { signSessionToken } from './token.util';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    // Khởi tạo nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.config.get<string>('SMTP_PORT') || '587', 10),
      secure: this.config.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.config.get<string>('SMTP_USER') || '',
        pass: this.config.get<string>('SMTP_PASS') || '',
      },
    });
  }

  private createSession(user: { id: string; name: string | null; email: string; role: 'CUSTOMER' | 'ADMIN' }) {
    return {
      user,
      accessToken: signSessionToken(user, this.config.get<string>('JWT_SECRET') ?? 'change-me'),
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        cart: { create: {} },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return this.createSession(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
      },
    });

    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const { password: _password, ...safeUser } = user;

    return this.createSession(safeUser);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.');
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 giờ

    // Lưu token vào database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires,
      },
    });

    // Tạo link đặt lại mật khẩu
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Gửi email
    try {
      if (this.config.get<string>('SMTP_USER')) {
        await this.transporter.sendMail({
          from: `"T3Sport" <${this.config.get<string>('SMTP_USER')}>`,
          to: user.email,
          subject: 'Đặt lại mật khẩu - T3Sport',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Yêu cầu đặt lại mật khẩu</h2>
              <p>Xin chào ${user.name || 'bạn'},</p>
              <p>Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại T3Sport.</p>
              <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu của bạn:</p>
              <p style="margin: 20px 0;">
                <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Đặt lại mật khẩu
                </a>
              </p>
              <p>Hoặc copy và dán đường dẫn này vào trình duyệt của bạn:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>Link này sẽ hết hạn sau 1 giờ.</p>
              <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
              <p>Trân trọng,<br>Đội ngũ T3Sport</p>
            </div>
          `,
        });
      } else {
        console.log('====== TEST MODE: EMAIL QUÊN MẬT KHẨU ======');
        console.log(`Đến: ${user.email}`);
        console.log(`Link: ${resetUrl}`);
        console.log('============================================');
      }
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      throw new InternalServerErrorException('Không thể gửi email. Vui lòng thử lại sau.');
    }

    return { message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn.');
    }

    // Cập nhật mật khẩu mới và xóa token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: dto.newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }
}

