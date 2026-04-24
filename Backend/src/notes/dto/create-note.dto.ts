import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000000, {
    message: '노트 내용이 너무 깁니다. (최대 1,000만 자까지 가능)',
  })
  content: string;

  @IsString()
  @IsNotEmpty()
  iv: string;

  @IsString()
  @IsOptional()
  tags?: string;

  @IsBoolean()
  @IsOptional()
  is_pinned?: boolean;

  @IsBoolean()
  @IsOptional()
  is_archived?: boolean;
}

export class UpdateNoteDto extends PartialType(CreateNoteDto) {}