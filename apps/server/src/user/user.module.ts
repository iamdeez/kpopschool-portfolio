import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { EmailVerificationService } from "./email-verification.service";

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, EmailVerificationService],
  exports: [UserService],
})
export class UserModule {}
