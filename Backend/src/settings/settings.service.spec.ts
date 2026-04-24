import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';

describe('SettingsService', () => {
  let service: SettingsService;

  const mockQuery = jest.fn();

  const mockDb = {
    query: mockQuery,
  } as unknown as Pool;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: 'PG_CONNECTION', useValue: mockDb },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  describe('findOne', () => {
    it('should return existing settings', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ user_id: 'u1', theme: 'dark', language: 'ko' }],
      });

      const result = await service.findOne('u1');

      expect(result.theme).toBe('dark');
    });

    it('should create default settings if none exist', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [
            {
              user_id: 'u1',
              theme: 'light',
              language: 'ko',
            },
          ],
        });

      const result = await service.findOne('u1');

      expect(result.theme).toBe('light');
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('should update settings successfully', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            user_id: 'u1',
            theme: 'dark',
            language: 'en',
          },
        ],
      });

      const dto = {
        theme: 'dark',
        language: 'en',
      };

      const result = await service.update('u1', dto as any);

      expect(result.message).toBe('Your settings have been saved.');
      expect(result.data.theme).toBe('dark');
    });

    it('should return message when no data to update', async () => {
      const result = await service.update('u1', {} as any);

      expect(result.message).toBe('There is no setup data to modify.');
    });

    it('should throw exception when settings not found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      const dto = {
        theme: 'dark',
      };

      await expect(service.update('u1', dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});