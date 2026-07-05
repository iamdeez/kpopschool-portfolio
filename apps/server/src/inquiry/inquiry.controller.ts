import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthenticatedUser } from "../auth/firebase-auth.guard";
import { InquiryService } from "./inquiry.service";
import { CreateInquiryDto } from "./dto/create-inquiry.dto";
import { UpdateInquiryDto } from "./dto/update-inquiry.dto";

@Controller("inquiry")
@UseGuards(FirebaseAuthGuard)
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Post()
  create(@Body() dto: CreateInquiryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.inquiryService.create({ ...dto, uid: user.uid });
  }

  @Get("me")
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.inquiryService.listByUser(user.uid);
  }

  @UseGuards(RolesGuard)
  @Roles("admin")
  @Get()
  listAll() {
    return this.inquiryService.list();
  }

  @UseGuards(RolesGuard)
  @Roles("admin")
  @Get("search")
  search(@Query("keyword") keyword: string) {
    return this.inquiryService.search(keyword ?? "");
  }

  @Get(":id")
  async get(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    const inquiry = await this.inquiryService.get(id);
    if (!user.isAdmin && inquiry.uid !== user.uid) {
      throw new ForbiddenException("You may only view your own inquiries");
    }
    return inquiry;
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateInquiryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const inquiry = await this.inquiryService.get(id);
    if (!user.isAdmin && inquiry.uid !== user.uid) {
      throw new ForbiddenException("You may only update your own inquiries");
    }
    // Only an admin may transition the state (answering/closing a ticket).
    if (dto.state && !user.isAdmin) {
      delete dto.state;
    }
    return this.inquiryService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    const inquiry = await this.inquiryService.get(id);
    if (!user.isAdmin && inquiry.uid !== user.uid) {
      throw new ForbiddenException("You may only delete your own inquiries");
    }
    await this.inquiryService.delete(id);
    return { message: "Inquiry deleted" };
  }
}
