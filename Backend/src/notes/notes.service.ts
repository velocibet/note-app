import { Injectable, Inject, BadGatewayException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateNoteDto, UpdateNoteDto } from './dto/create-note.dto';
import { ulid } from 'ulid';

@Injectable()
export class NotesService {
  constructor(
    @Inject('PG_CONNECTION') private db: Pool,
  ) {}

  async create(userId: string, createNoteDto: CreateNoteDto) {
    const {
      title,
      content,
      iv,
      tags = [],
      is_pinned = false
     } = createNoteDto;

    const id = ulid();
    const { rows } = await this.db.query(`
      INSERT INTO user_notes
      (id, user_id, title, content, iv, tags, is_pinned)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [id, userId, title, content, iv, tags, is_pinned])

    return {
      message: 'Note created successfully.',
      data: {
        id: rows[0].id
      }
    }
  }

  async findAll(userId: string) {
    const { rows } = await this.db.query(`
      SELECT id, title, content, iv, tags, is_pinned, is_archived, created_at, updated_at, is_deleted, deleted_at
      FROM user_notes
      WHERE user_id = $1
    `, [userId])

    return rows;
  }

  async findOne(userId: string, id: string) {
    const { rows } = await this.db.query(`
      SELECT *
      FROM user_notes
      WHERE id = $1
      LIMIT 1
      `, [id]
    )

    if (rows.length < 1) throw new BadRequestException("Note does not exist or you do not have permission.");

    const post = rows[0];
    if (post.user_id !== userId) throw new BadRequestException("Note does not exist or you do not have permission.");
    
    return post;
  }

  async update(userId: string, id: string, updateNoteDto: UpdateNoteDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let argIndex = 1;

    for (const [key, value] of Object.entries(updateNoteDto)) {
      if (value !== undefined) {
        fields.push(`${key} = $${argIndex}`);
        values.push(value);
        argIndex++;
      }
    }

    if (fields.length === 0) {
      return { message: 'No data to update.' };
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE user_notes
      SET ${fields.join(', ')}
      WHERE id = $${argIndex} AND user_id = $${argIndex + 1}
      RETURNING id
    `;
    
    values.push(id, userId);

    const { rows } = await this.db.query(query, values);

    if (rows.length < 1) {
      throw new BadRequestException("Note does not exist or you do not have permission.");
    }

    return {
      message: 'Note updated successfully.',
      data: { id: rows[0].id }
    };
  }

  async softRemove(userId: string, id: string) {
    const { rowCount } = await this.db.query(`
      UPDATE user_notes
      SET is_deleted = true, deleted_at = NOW()
      WHERE user_id = $1 AND id = $2 AND is_deleted = false
    `, [userId, id]);

    if (rowCount === 0) throw new BadRequestException("Note not found or already deleted.");
    return "Note moved to trash.";
  }

  async permanentRemove(userId: string, id: string) {
    const { rowCount } = await this.db.query(`
      DELETE FROM user_notes
      WHERE user_id = $1 AND id = $2
    `, [userId, id]);

    if (rowCount === 0) throw new BadRequestException("Note not found.");
    return "Note permanently deleted.";
  }

  async restore(userId: string, id: string) {
    const { rowCount } = await this.db.query(`
      UPDATE user_notes
      SET is_deleted = false, deleted_at = NULL
      WHERE user_id = $1 AND id = $2 AND is_deleted = true
    `, [userId, id]);

    if (rowCount === 0) throw new BadRequestException("Note not found to restore.");
    return "Note restored successfully.";
  }
}