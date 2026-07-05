import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurriculumService } from "./curriculum.service";
import { CreateCurriculumDto } from "./dto/create-curriculum.dto";
import { UpdateCurriculumDto } from "./dto/update-curriculum.dto";

@Controller("curriculums")
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get()
  list() {
    return this.curriculumService.list();
  }

  @Get("search")
  search(@Query("keyword") keyword: string) {
    return this.curriculumService.search(keyword ?? "");
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.curriculumService.get(id);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  create(@Body() dto: CreateCurriculumDto) {
    return this.curriculumService.create(dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCurriculumDto) {
    return this.curriculumService.update(id, dto);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.curriculumService.delete(id);
    return { message: "Curriculum deleted" };
  }
}
