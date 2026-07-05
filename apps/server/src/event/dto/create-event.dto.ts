import { IsNumber, IsString } from "class-validator";

export class CreateEventDto {
  @IsNumber() index!: number;
  @IsString() thumbnail!: string;
  @IsString() title!: string;
  @IsString() description!: string;
  @IsString() discountType!: string;
  @IsNumber() discountAmount!: number;
  @IsString() deadlineStart!: string;
  @IsString() deadlineEnd!: string;
  @IsString() useStart!: string;
  @IsString() useEnd!: string;
}
