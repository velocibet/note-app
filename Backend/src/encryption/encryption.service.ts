import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(
      private configService: ConfigService
    ) {}

  onModuleInit() {
    const keyHex = this.configService.get<string>('ENCRYPTION_KEY');
    if (!keyHex || keyHex.length !== 64) {
      throw new Error('ENCRYPTION_KEY가 .env에 없거나 32바이트(64글자)가 아닙니다.');
    }

    // 메모리에 키 저장
    this.key = Buffer.from(keyHex, 'hex');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  hashEmail(email: string): string {
    const normalized = email.trim().toLowerCase();

    return crypto
      .createHmac('sha256', this.key)
      .update(normalized)
      .digest('hex');
  }

  verifyEmailHash(email: string, hash: string): boolean {
    const computed = this.hashEmail(email);
    return crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(hash),
    );
  }
}