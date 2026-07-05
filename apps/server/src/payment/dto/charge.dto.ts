import { IsString } from "class-validator";

export class ChargeDto {
  @IsString() productId!: string;
  @IsString() paymentMethodId!: string;
}
