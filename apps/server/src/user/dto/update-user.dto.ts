import { IsArray, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  profile?: string;

  @IsOptional()
  @IsArray()
  interest?: string[];

  @IsOptional()
  @IsArray()
  interestClass?: string[];

  @IsOptional()
  @IsArray()
  interestTeacher?: string[];

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  frequency?: string;
}
