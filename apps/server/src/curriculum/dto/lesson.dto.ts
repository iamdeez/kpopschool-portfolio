import { IsNumber, IsString } from "class-validator";

export class LessonDto {
  @IsString() id!: string;
  @IsString() title!: string;
  @IsNumber() order!: number;
  @IsString() videoUrl!: string;
  @IsNumber() durationMinutes!: number;
}
