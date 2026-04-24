import { IsString, IsOptional } from "class-validator";

export class UpdateSettingDto {
    @IsString()
    @IsOptional()
    theme?: string;

    @IsString()
    @IsOptional()
    language?: string;
}