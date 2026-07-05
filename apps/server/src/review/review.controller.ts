import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthenticatedUser } from "../auth/firebase-auth.guard";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

@Controller("review")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Social proof — public read, no auth required.
  @Get()
  list() {
    return this.reviewService.list();
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.reviewService.get(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post()
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewService.create({ ...dto, userId: user.uid });
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const review = await this.reviewService.get(id);
    if (!user.isAdmin && review.userId !== user.uid) {
      throw new ForbiddenException("You may only edit your own review");
    }
    return this.reviewService.update(id, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    const review = await this.reviewService.get(id);
    if (!user.isAdmin && review.userId !== user.uid) {
      throw new ForbiddenException("You may only delete your own review");
    }
    await this.reviewService.delete(id);
    return { message: "Review deleted" };
  }
}
