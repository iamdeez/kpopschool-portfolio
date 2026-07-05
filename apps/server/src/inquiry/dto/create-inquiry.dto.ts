import { IsString } from "class-validator";

export class CreateInquiryDto {
  @IsString() tag!: string;
  @IsString() title!: string;
  @IsString() details!: string;
}
