import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { HomeService } from "./home.service";

@Controller("home")
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  list() {
    return this.homeService.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.homeService.get(id);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Patch(":id")
  update(@Param("id") id: string, @Body() data: Record<string, unknown>) {
    return this.homeService.update(id, data);
  }
}
