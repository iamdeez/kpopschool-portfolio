import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateCurriculumDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() format?: string;
  @IsOptional() @IsNumber() month?: number;
  @IsOptional() @IsNumber() totalSessions?: number;
  @IsOptional() @IsArray() sessions?: string[];
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() difficulty?: string;
}
