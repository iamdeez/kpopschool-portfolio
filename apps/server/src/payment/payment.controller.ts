import { Body, Controller, Get, Inject, NotFoundException, Param, Post, UseGuards } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { Product } from "@kpopschool/shared-types";
import { FirebaseAuthGuard } from "../auth/firebase-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthenticatedUser } from "../auth/firebase-auth.guard";
import { FIRESTORE } from "../common/firebase-admin.module";
import { PAYMENT_GATEWAY, PaymentGateway } from "./payment-gateway.interface";
import { CreateProductDto } from "./dto/create-product.dto";
import { ChargeDto } from "./dto/charge.dto";

@Controller("payment")
export class PaymentController {
  constructor(
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway,
    @Inject(FIRESTORE) private readonly firestore: Firestore,
  ) {}

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Post("products")
  createProduct(@Body() dto: CreateProductDto) {
    return this.paymentGateway.createProduct(dto);
  }

  // Must come before "products/:id" — Express/Nest route matching is
  // order-sensitive and "by-curriculum" would otherwise be captured as :id.
  @Get("products/by-curriculum/:curriculumId")
  async getProductByCurriculum(@Param("curriculumId") curriculumId: string) {
    const snapshot = await this.firestore
      .collection("products")
      .where("metadata.curriculumId", "==", curriculumId)
      .limit(1)
      .get();
    if (snapshot.empty) {
      throw new NotFoundException(`No product found for curriculum ${curriculumId}`);
    }
    return snapshot.docs[0].data() as Product;
  }

  @Get("products/:id")
  getProduct(@Param("id") id: string) {
    return this.paymentGateway.getProduct(id);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post("charge")
  charge(@Body() dto: ChargeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paymentGateway.charge({ ...dto, uid: user.uid });
  }

  @UseGuards(FirebaseAuthGuard)
  @Get("me")
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentGateway.listPayments(user.uid);
  }

  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles("admin")
  @Get()
  listAll() {
    return this.paymentGateway.listAllPayments();
  }
}
