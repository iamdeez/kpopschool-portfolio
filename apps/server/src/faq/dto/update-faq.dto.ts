import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateFaqDto {
  @IsOptional() @IsNumber() index?: number;
  @IsOptional() @IsString() question?: string;
  @IsOptional() @IsString() answer?: string;
}
