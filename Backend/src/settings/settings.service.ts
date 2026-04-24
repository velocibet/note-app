import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { UpdateSettingDto } from './dto/create-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @Inject('PG_CONNECTION') private db: Pool,
  ) {}

  async findOne(userId: string) {
    const { rows } = await this.db.query(`
      SELECT user_id, theme, language, updated_at
      FROM user_settings
      WHERE user_id = $1
      LIMIT 1
    `, [userId]);

    if (rows.length < 1) {
      const newSetting = await this.db.query(`
        INSERT INTO user_settings (user_id, theme, language)
        VALUES ($1, $2, $3)
        RETURNING user_id, theme, language, updated_at
      `, [userId, 'light', 'ko']);
      
      return newSetting.rows[0];
    }

    return rows[0];
  }

  async update(userId: string, updateSettingDto: UpdateSettingDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let argIndex = 1;

    for (const [key, value] of Object.entries(updateSettingDto)) {
      if (value !== undefined) {
        fields.push(`${key} = $${argIndex}`);
        values.push(value);
        argIndex++;
      }
    }

    if (fields.length === 0) {
      return { message: 'There is no setup data to modify.' };
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE user_settings
      SET ${fields.join(', ')}
      WHERE user_id = $${argIndex}
      RETURNING *
    `;

    const { rows } = await this.db.query(query, values);

    if (rows.length < 1) {
      throw new BadRequestException("Setup information not found.");
    }

    return {
      message: 'Your settings have been saved.',
      data: rows[0]
    };
  }
}