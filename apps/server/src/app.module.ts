import { Module } from "@nestjs/common";
import { ConfigModule } from "./common/config.module";
import { FirebaseAdminModule } from "./common/firebase-admin.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { DemoModule } from "./demo/demo.module";
import { TeacherModule } from "./teacher/teacher.module";
import { CurriculumModule } from "./curriculum/curriculum.module";
import { EventModule } from "./event/event.module";
import { FaqModule } from "./faq/faq.module";
import { InquiryModule } from "./inquiry/inquiry.module";
import { ReviewModule } from "./review/review.module";
import { HomeModule } from "./home/home.module";
import { PaymentModule } from "./payment/payment.module";
import { VideoClassModule } from "./video-class/video-class.module";

@Module({
  imports: [
    ConfigModule,
    FirebaseAdminModule,
    AuthModule,
    UserModule,
    DemoModule,
    TeacherModule,
    CurriculumModule,
    EventModule,
    FaqModule,
    InquiryModule,
    ReviewModule,
    HomeModule,
    PaymentModule,
    VideoClassModule,
  ],
})
export class AppModule {}
