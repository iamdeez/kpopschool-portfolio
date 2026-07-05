import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CurriculumModule } from "../curriculum/curriculum.module";
import { PaymentModule } from "../payment/payment.module";
import { ReportingController } from "./reporting.controller";
import { ReportingService } from "./reporting.service";

@Module({
  imports: [AuthModule, CurriculumModule, PaymentModule],
  controllers: [ReportingController],
  providers: [ReportingService],
})
export class ReportingModule {}
