import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class QuizQuestionDto {
  @IsString() id!: string;
  @IsString() question!: string;
  @IsArray() @IsString({ each: true }) options!: string[];
  @IsNumber() correctOptionIndex!: number;
}

export class LessonDto {
  @IsString() id!: string;
  @IsString() title!: string;
  @IsNumber() order!: number;
  @IsString() videoUrl!: string;
  @IsNumber() durationMinutes!: number;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  quiz?: QuizQuestionDto[];
}
