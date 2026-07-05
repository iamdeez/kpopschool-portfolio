import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";
import { LessonDto } from "./lesson.dto";

export class CreateCurriculumDto {
  @IsString() title!: string;
  @IsString() image!: string;
  @IsString() teacherId!: string;
  @IsString() category!: string;
  @IsString() format!: string;
  @IsNumber() month!: number;
  @IsNumber() totalSessions!: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  lessons!: LessonDto[];
  @IsNumber() price!: number;
  @IsString() description!: string;
  @IsString() difficulty!: string;
}
