import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CurriculumModule } from "../curriculum/curriculum.module";
import { ProgressController } from "./progress.controller";
import { ProgressService } from "./progress.service";

@Module({
  imports: [AuthModule, CurriculumModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
