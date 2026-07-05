import { IsNumber, IsString } from "class-validator";

export class CreateProductDto {
  @IsString() name!: string;
  @IsString() description!: string;
  @IsString() curriculumId!: string;
  @IsNumber() unitAmount!: number;
  @IsString() currency!: string;
}
