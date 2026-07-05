import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { LessonDto } from "./lesson.dto";

export class UpdateCurriculumDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() format?: string;
  @IsOptional() @IsNumber() month?: number;
  @IsOptional() @IsNumber() totalSessions?: number;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  lessons?: LessonDto[];
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() difficulty?: string;
}
