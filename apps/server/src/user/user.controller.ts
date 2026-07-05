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
import { UserService } from "./user.service";
import { EmailVerificationService } from "./email-verification.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailVerification: EmailVerificationService,
  ) {}

  // Public: account creation has no caller identity to authenticate yet.
  @Post("register")
  register(@Body() dto: CreateUserDto) {
    return this.userService.register(dto);
  }

  @Post("send-verification")
  sendVerification(@Body("email") email: string) {
    return this.emailVerification.sendCode(email);
  }

  @Post("check-verification")
  checkVerification(@Body() body: { email: string; code: string }) {
    return { valid: this.emailVerification.checkCode(body.email, body.code) };
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Get("search")
  search(@Query("keyword") keyword: string) {
    return this.userService.search(keyword ?? "");
  }

  @UseGuards(FirebaseAuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    if (!user.isAdmin && user.uid !== id) {
      throw new ForbiddenException("You may only view your own profile");
    }
    return this.userService.findOne(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user.isAdmin && user.uid !== id) {
      throw new ForbiddenException("You may only update your own profile");
    }
    return this.userService.update(id, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch(":id/password")
  async changePassword(
    @Param("id") id: string,
    @Body("password") password: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!user.isAdmin && user.uid !== id) {
      throw new ForbiddenException("You may only change your own password");
    }
    await this.userService.changePassword(id, password);
    return { message: "Password changed" };
  }

  // Replaces the original GET /deleteAuth/:id (research.md VULN-005):
  // destructive action, now DELETE + authenticated + owner/admin-checked.
  @UseGuards(FirebaseAuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    if (!user.isAdmin && user.uid !== id) {
      throw new ForbiddenException("You may only delete your own account");
    }
    await this.userService.remove(id);
    return { message: "User deleted" };
  }
}
