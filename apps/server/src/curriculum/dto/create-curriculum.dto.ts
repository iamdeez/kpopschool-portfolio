import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateCurriculumDto {
  @IsString() title!: string;
  @IsString() image!: string;
  @IsString() teacherId!: string;
  @IsString() category!: string;
  @IsString() format!: string;
  @IsNumber() month!: number;
  @IsNumber() totalSessions!: number;
  @IsArray() sessions!: string[];
  @IsNumber() price!: number;
  @IsString() description!: string;
  @IsString() difficulty!: string;
}
