import { createHmac, timingSafeEqual } from 'crypto';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'CUSTOMER' | 'ADMIN';
};

type TokenPayload = SessionUser & {
  exp: number;
};

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url');
}

function sign(input: string, secret: string) {
  return createHmac('sha256', secret).update(input).digest('base64url');
}

export function signSessionToken(user: SessionUser, secret: string) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      ...user,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }),
  );
  const signature = sign(`${header}.${payload}`, secret);

  return `${header}.${payload}.${signature}`;
}

export function verifySessionToken(token: string, secret: string): SessionUser | null {
  const [header, payload, signature] = token.split('.');

  if (!header || !payload || !signature) {
    return null;
  }

  const expected = sign(`${header}.${payload}`, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  let parsed: TokenPayload;

  try {
    parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TokenPayload;
  } catch {
    return null;
  }

  if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    id: parsed.id,
    email: parsed.email,
    name: parsed.name,
    role: parsed.role,
  };
}
