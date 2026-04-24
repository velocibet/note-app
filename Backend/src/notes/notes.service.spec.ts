import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';

describe('NotesService', () => {
  let service: NotesService;

  const mockQuery = jest.fn();

  const mockDb = {
    query: mockQuery,
  } as unknown as Pool;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: 'PG_CONNECTION', useValue: mockDb },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  describe('create', () => {
    it('should create a note successfully', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'note1' }],
      });

      const dto = {
        title: 'title',
        content: 'content',
        iv: 'iv',
        tags: 'tag1,tag2',
        is_pinned: true,
      };

      const result = await service.create('user1', dto as any);

      expect(result.message).toBe('Note created successfully.');
      expect(result.data.id).toBe('note1');
    });
  });

  describe('findAll', () => {
    it('should return all notes', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'n1' }, { id: 'n2' }],
      });

      const result = await service.findAll('user1');

      expect(result.length).toBe(2);
      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a note', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'n1', user_id: 'user1' }],
      });

      const result = await service.findOne('user1', 'n1');

      expect(result.id).toBe('n1');
    });

    it('should throw BadRequestException if note does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(service.findOne('user1', 'n1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no permission', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'n1', user_id: 'other' }],
      });

      await expect(service.findOne('user1', 'n1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a note successfully', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'n1' }],
      });

      const dto = {
        title: 'new title',
      };

      const result = await service.update('user1', 'n1', dto as any);

      expect(result.message).toBe('Note updated successfully.');
    });

    it('should return message when no data to update', async () => {
      const result = await service.update('user1', 'n1', {} as any);

      expect(result.message).toBe('No data to update.');
    });

    it('should throw error if note does not exist', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      const dto = {
        title: 'new title',
      };

      await expect(service.update('user1', 'n1', dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('softRemove', () => {
    it('should move note to trash', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.softRemove('user1', 'n1');

      expect(result).toContain('trash');
    });

    it('should throw error if delete fails', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      await expect(service.softRemove('user1', 'n1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('permanentRemove', () => {
    it('should permanently delete note', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.permanentRemove('user1', 'n1');

      expect(result).toContain('permanently');
    });

    it('should throw error if delete fails', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      await expect(
        service.permanentRemove('user1', 'n1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('restore', () => {
    it('should restore note successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await service.restore('user1', 'n1');

      expect(result).toContain('restored');
    });

    it('should throw error if restore fails', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      await expect(service.restore('user1', 'n1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});