import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { TeacherService } from "./teacher.service";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";

@Controller("teachers")
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // Catalog data — public read, no auth required (visitors browse before signing up).
  @Get()
  list() {
    return this.teacherService.list();
  }

  @Get("search")
  search(@Query("keyword") keyword: string) {
    return this.teacherService.search(keyword ?? "");
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.teacherService.get(id);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  create(@Body() dto: CreateTeacherDto) {
    return this.teacherService.create(dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.update(id, dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.teacherService.delete(id);
    return { message: "Teacher deleted" };
  }
}
