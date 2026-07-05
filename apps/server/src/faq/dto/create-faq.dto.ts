import { IsNumber, IsString } from "class-validator";

export class CreateFaqDto {
  @IsNumber() index!: number;
  @IsString() question!: string;
  @IsString() answer!: string;
}
