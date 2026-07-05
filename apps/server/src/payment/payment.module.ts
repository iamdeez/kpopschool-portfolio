import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { APP_CONFIG } from "../common/config.module";
import type { AppConfig } from "../common/config";
import { PaymentController } from "./payment.controller";
import { PAYMENT_GATEWAY } from "./payment-gateway.interface";
import { StripePaymentGateway } from "./stripe-payment.gateway";
import { MockPaymentGateway } from "./mock-payment.gateway";
import { selectPaymentGateway } from "./select-payment-gateway";

@Module({
  imports: [AuthModule],
  controllers: [PaymentController],
  providers: [
    StripePaymentGateway,
    MockPaymentGateway,
    {
      provide: PAYMENT_GATEWAY,
      inject: [APP_CONFIG, StripePaymentGateway, MockPaymentGateway],
      useFactory: selectPaymentGateway,
    },
  ],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentModule {}
