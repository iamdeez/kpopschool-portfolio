import { IsOptional, IsString } from "class-validator";

export class UpdateTeacherDto {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() career?: string;
  @IsOptional() @IsString() profile?: string;
}
