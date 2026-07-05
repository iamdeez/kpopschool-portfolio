import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateEventDto {
  @IsOptional() @IsNumber() index?: number;
  @IsOptional() @IsString() thumbnail?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() discountType?: string;
  @IsOptional() @IsNumber() discountAmount?: number;
  @IsOptional() @IsString() deadlineStart?: string;
  @IsOptional() @IsString() deadlineEnd?: string;
  @IsOptional() @IsString() useStart?: string;
  @IsOptional() @IsString() useEnd?: string;
}
