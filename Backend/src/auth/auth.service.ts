import { Injectable, Inject, BadRequestException, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { RegisterDto, LoginDto, ChangeMasterKeyDto } from './dto/create-auth.dto';
import { Pool } from 'pg';
import { EncryptionService } from '../encryption/encryption.service';
import argon2 from 'argon2';
import { ulid } from 'ulid';

@Injectable()
export class AuthService {
  constructor(
    @Inject('PG_CONNECTION') private db: Pool,
    private readonly encryptionService: EncryptionService
  ) {}

  async getRegister(registerAuthDto: RegisterDto) {
    const { username, email, password, keyInfo } = registerAuthDto;
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      const encryptedEmail = await this.encryptionService.encrypt(email);
      const emailHash = this.encryptionService.hashEmail(email);

      const { rows: existingUser } = await client.query(
        `SELECT username, email FROM users WHERE username = $1 OR email = $2`,
        [username, encryptedEmail]
      );
      
      if (existingUser.length > 0) {
        if (existingUser.some(u => u.username === username)) {
          throw new ConflictException('Username already exists.');
        }
      }
      
      const { rows: existingEmail } = await client.query(
        `SELECT id FROM email_hash WHERE email = $1`,
        [emailHash]
      );

      if (existingEmail.length > 0) {
        throw new ConflictException('Email already exists.');
      }

      const hashedPassword = await argon2.hash(password);
      const id = ulid();

      const { rows: users } = await client.query(
        `INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [id, username, encryptedEmail, hashedPassword]
      );

      const user = users[0];

      await client.query(
        `INSERT INTO vault_keys (id, vault_key_salt, encrypted_vault_key, vault_key_iv) VALUES ($1, $2, $3, $4)`,
        [id, keyInfo.salt, keyInfo.encryptedKey, keyInfo.iv]
      );

      await client.query('COMMIT');
      return 'Registration completed successfully.';
    } catch (error) {
      await client.query('ROLLBACK');
      console.log(error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException("Registration failed due to an unknown error.");
    } finally {
      client.release();
    }
  }

  async getLogin(loginAuthDto: LoginDto, session: Record<string, any>) {
    const { username, password } = loginAuthDto;

    const { rows } = await this.db.query(
      `SELECT id, username, password FROM users WHERE username = $1 LIMIT 1`,
      [username]
    );

    if (rows.length < 1) throw new UnauthorizedException("Invalid username or password.");

    const user = rows[0];
    const verify = await argon2.verify(user.password, password);

    if (!verify) throw new UnauthorizedException("Invalid username or password.");

    const { rows: vaultKeys } = await this.db.query(`
      SELECT vault_key_salt, encrypted_vault_key, vault_key_iv FROM vault_keys WHERE id = $1`,
      [user.id]
    );

    session.user = {
      id: user.id,
      username: user.username,
      loggedInAt: new Date().toISOString(),
    };

    return {
      message: "Logged in successfully.",
      data: {
        username: user.username,
        vaultKeys: vaultKeys[0]
      }
    };
  }

  async getLogout(session: any): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      session.destroy((err) => {
        if (err) {
          reject(new InternalServerErrorException('An error occurred during logout.'));
        }
        resolve({ success: true });
      });
    });
  }

  async withdraw(userId: string, session: any) {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      await client.query(`DELETE FROM user_notes WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM user_settings WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM vault_keys WHERE id = $1`, [userId]);
      await client.query(`DELETE FROM email_hash WHERE user_id = $1`, [userId]);

      const { rowCount } = await client.query(
        `DELETE FROM users WHERE id = $1`,
        [userId]
      );

      if (rowCount === 0) {
        throw new BadRequestException("User not found.");
      }

      await client.query('COMMIT');

      await new Promise<void>((resolve, reject) => {
        session.destroy((err) => {
          if (err) reject(err);
          resolve();
        });
      });

      return { success: true };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async changeMasterKey(userId: string, dto: ChangeMasterKeyDto) {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      await client.query(`
        UPDATE vault_keys
        SET 
          encrypted_vault_key = $1,
          vault_key_iv = $2,
          vault_key_salt = $3
        WHERE id = $4
      `, [
        dto.vaultKeyInfo.encryptedKey,
        dto.vaultKeyInfo.iv,
        dto.vaultKeyInfo.salt,
        userId
      ]);

      for (const note of dto.notes) {
        await client.query(`
          UPDATE user_notes
          SET 
            title = $1,
            content = $2,
            tags = $3,
            iv = $4,
            updated_at = NOW()
          WHERE id = $5 AND user_id = $6
        `, [
          note.title,
          note.content,
          note.tags || null,
          note.iv,
          note.id,
          userId
        ]);
      }

      await client.query('COMMIT');

      return 'Master key has been successfully changed.';
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InternalServerErrorException('Failed to change master key.');
    } finally {
      client.release();
    }
  }

  async verifyPassword(userId: string, password: string) {
    const { rows } = await this.db.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      throw new UnauthorizedException('User not found.');
    }

    const user = rows[0];

    const isValid = await argon2.verify(user.password, password);

    if (!isValid) {
      throw new UnauthorizedException('Password does not match.');
    }

    return {
      success: true,
      message: 'Password verified successfully.'
    };
  }
}