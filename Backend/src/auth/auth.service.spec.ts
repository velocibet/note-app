import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { EncryptionService } from '../encryption/encryption.service';
import argon2 from 'argon2';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;

  const mockQuery = jest.fn();
  const mockRelease = jest.fn();

  const mockClient = {
    query: mockQuery,
    release: mockRelease,
  };

  const mockDb = {
    connect: jest.fn(),
    query: jest.fn(),
  };

  const mockEncryptionService = {
    encrypt: jest.fn(),
    hashEmail: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    (mockDb.connect as jest.Mock).mockResolvedValue(mockClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'PG_CONNECTION', useValue: mockDb },
        { provide: EncryptionService, useValue: mockEncryptionService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('getRegister', () => {
    it('should register successfully', async () => {
      mockEncryptionService.encrypt.mockResolvedValue('enc-email');
      mockEncryptionService.hashEmail.mockReturnValue('hashed-email');

      mockQuery
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'user1' }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      const dto = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        keyInfo: {
          encryptedKey: 'key',
          iv: 'iv',
          salt: 'salt',
        },
      };

      const result = await service.getRegister(dto as any);

      expect(result).toBe('Registration completed successfully.');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should throw ConflictException for duplicate username', async () => {
      mockEncryptionService.encrypt.mockResolvedValue('enc-email');
      mockEncryptionService.hashEmail.mockReturnValue('hashed-email');

      mockQuery
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ username: 'testuser', email: 'enc-email' }] });

      const dto = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        keyInfo: {
          encryptedKey: 'key',
          iv: 'iv',
          salt: 'salt',
        },
      };

      await expect(service.getRegister(dto as any)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockEncryptionService.encrypt.mockResolvedValue('enc-email');
      mockEncryptionService.hashEmail.mockReturnValue('hashed-email');

      mockQuery
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const dto = {
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        keyInfo: {
          encryptedKey: 'key',
          iv: 'iv',
          salt: 'salt',
        },
      };

      await expect(service.getRegister(dto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('getLogin', () => {
    it('should login successfully', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{ id: 'user1', username: 'testuser', password: 'hashed' }],
        })
        .mockResolvedValueOnce({
          rows: [{ vault_key_salt: 's', encrypted_vault_key: 'k', vault_key_iv: 'i' }],
        });

      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const session: any = {};

      const result = await service.getLogin(
        { username: 'testuser', password: '1234' },
        session,
      );

      expect(result.message).toBe('Logged in successfully.');
      expect(session.user).toBeDefined();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'user1', username: 'testuser', password: 'hashed' }],
      });

      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.getLogin({ username: 'testuser', password: 'wrong' }, {} as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyPassword', () => {
    it('should verify password successfully', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ password: 'hashed' }],
      });

      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyPassword('user1', '1234');

      expect(result.success).toBe(true);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ password: 'hashed' }],
      });

      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyPassword('user1', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changeMasterKey', () => {
    it('should change master key successfully', async () => {
      mockClient.query.mockResolvedValue({});

      const dto = {
        vaultKeyInfo: {
          encryptedKey: 'k',
          iv: 'i',
          salt: 's',
        },
        notes: [
          {
            id: 'n1',
            title: 't',
            content: 'c',
            tags: '',
            iv: 'i',
          },
        ],
      };

      const result = await service.changeMasterKey('user1', dto as any);

      expect(result).toContain('successfully');
    });
  });

  describe('withdraw', () => {
    it('should withdraw successfully', async () => {
      mockClient.query.mockResolvedValue({ rowCount: 1 });

      const session = {
        destroy: jest.fn((cb) => cb(null)),
      };

      const result = await service.withdraw('user1', session);

      expect(result.success).toBe(true);
    });
  });
});