import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty, IsObject, IsOptional, IsArray, ArrayNotEmpty, ValidateNested, Matches, isString } from 'class-validator';
import { Type } from 'class-transformer';

export class VaultKeyInfoDto {
    @IsString()
    @IsNotEmpty()
    encryptedKey: string;

    @IsString()
    @IsNotEmpty()
    iv: string;

    @IsString()
    @IsNotEmpty()
    salt: string;
}

export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: '아이디는 필수입니다.' })
    @MinLength(6, { message: '아이디는 최소 6자 이상이어야 합니다.' })
    @MaxLength(20, { message: '아이디는 최대 20자 이하로 설정해주세요.' })
    username: string;

    @IsString()
    @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
    @IsNotEmpty({ message: '이메일은 필수입니다.' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
    @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
    @MaxLength(32, { message: '비밀번호는 최대 32자 이하로 설정해주세요.' })
    password: string;

    @IsObject()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => VaultKeyInfoDto)
    keyInfo: VaultKeyInfoDto;
}

export class LoginDto {
    @IsString()
    @IsNotEmpty({ message: '아이디는 필수입니다.' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
    password: string;
}

export class NoteReEncryptDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsString()
  @IsNotEmpty()
  iv: string;
}

export class ChangeMasterKeyDto {
  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VaultKeyInfoDto)
  vaultKeyInfo: VaultKeyInfoDto;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => NoteReEncryptDto)
  notes: NoteReEncryptDto[];
}

export class VerifyPasswordDto {
  @IsString()
  password: string;
}