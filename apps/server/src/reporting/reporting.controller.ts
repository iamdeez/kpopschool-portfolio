import { Controller, Get, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ReportingService } from "./reporting.service";

@Controller("admin/reports")
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles("admin")
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get("summary")
  getSummary() {
    return this.reportingService.getSummary();
  }
}
