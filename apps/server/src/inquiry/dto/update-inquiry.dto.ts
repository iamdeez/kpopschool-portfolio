import { IsIn, IsOptional, IsString } from "class-validator";

export class UpdateInquiryDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() details?: string;
  @IsOptional() @IsIn(["pending", "answered", "closed"]) state?: "pending" | "answered" | "closed";
}
