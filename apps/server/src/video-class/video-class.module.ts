import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { APP_CONFIG } from "../common/config.module";
import type { AppConfig } from "../common/config";
import { VideoClassController } from "./video-class.controller";
import { VIDEO_CLASS_PROVIDER } from "./video-class-provider.interface";
import { ZoomVideoClassProvider } from "./zoom-video-class.provider";
import { MockVideoClassProvider } from "./mock-video-class.provider";

@Module({
  imports: [AuthModule],
  controllers: [VideoClassController],
  providers: [
    ZoomVideoClassProvider,
    MockVideoClassProvider,
    {
      provide: VIDEO_CLASS_PROVIDER,
      inject: [APP_CONFIG, ZoomVideoClassProvider, MockVideoClassProvider],
      useFactory: (config: AppConfig, real: ZoomVideoClassProvider, mock: MockVideoClassProvider) =>
        config.integrationMode === "real" ? real : mock,
    },
  ],
})
export class VideoClassModule {}
