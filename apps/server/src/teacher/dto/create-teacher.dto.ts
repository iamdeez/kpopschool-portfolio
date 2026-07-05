import { IsString } from "class-validator";

export class CreateTeacherDto {
  @IsString()
  category!: string;

  @IsString()
  name!: string;

  @IsString()
  career!: string;

  @IsString()
  profile!: string;
}
