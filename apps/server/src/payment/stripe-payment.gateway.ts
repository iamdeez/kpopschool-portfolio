import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import Stripe from "stripe";
import type { Firestore } from "firebase-admin/firestore";
import type {
  ChargeInput,
  ChargeResult,
  CreateProductInput,
  PaymentRecord,
  Product,
} from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { APP_CONFIG } from "../common/config.module";
import type { AppConfig } from "../common/config";
import type { PaymentGateway } from "./payment-gateway.interface";
import { assertNotAlreadyPurchased } from "./purchase-guard";

const PRODUCTS_COLLECTION = "products";
const CUSTOMERS_COLLECTION = "customers";

/**
 * Real Stripe SDK integration (research.md replaces the hardcoded restricted
 * key from payment-routes.js — VULN-002 — with STRIPE_SECRET_KEY from env).
 * Selected at runtime only when INTEGRATION_MODE=real (payment.module.ts) —
 * but NestJS instantiates every provider in a module regardless of which one
 * the DI factory ends up choosing, so the Stripe client itself must be
 * lazy: constructing `new Stripe("")` eagerly would crash demo-mode boot.
 */
@Injectable()
export class StripePaymentGateway implements PaymentGateway {
  private stripeClient: Stripe | undefined;

  constructor(
    @Inject(FIRESTORE) private readonly firestore: Firestore,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  private get stripe(): Stripe {
    if (!this.stripeClient) {
      this.stripeClient = new Stripe(this.config.stripe.secretKey);
    }
    return this.stripeClient;
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    const product = await this.stripe.products.create({
      name: input.name,
      description: input.description,
      metadata: { curriculumId: input.curriculumId },
    });

    const price = await this.stripe.prices.create({
      unit_amount: input.unitAmount,
      currency: input.currency,
      product: product.id,
    });

    const record: Product = {
      id: product.id,
      name: input.name,
      description: input.description,
      metadata: { curriculumId: input.curriculumId },
      price: { unitAmount: input.unitAmount, currency: input.currency },
    };

    await this.firestore.collection(PRODUCTS_COLLECTION).doc(product.id).set({
      ...record,
      stripePriceId: price.id,
    });

    return record;
  }

  async getProduct(productId: string): Promise<Product> {
    const doc = await this.firestore.collection(PRODUCTS_COLLECTION).doc(productId).get();
    if (!doc.exists) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    return doc.data() as Product;
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    const product = await this.getProduct(input.productId);
    await assertNotAlreadyPurchased(this.firestore, input.uid, input.productId);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: product.price.unitAmount,
      currency: product.price.currency,
      payment_method: input.paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });

    const payment: PaymentRecord = {
      id: paymentIntent.id,
      uid: input.uid,
      productId: input.productId,
      amount: product.price.unitAmount,
      currency: product.price.currency,
      createdAt: new Date().toISOString(),
    };

    await this.firestore
      .collection(CUSTOMERS_COLLECTION)
      .doc(input.uid)
      .collection("payments")
      .doc(paymentIntent.id)
      .set(payment);

    const status = paymentIntent.status === "succeeded" ? "succeeded" : "requires_action";
    return { payment, status };
  }

  async listPayments(uid: string): Promise<PaymentRecord[]> {
    const snapshot = await this.firestore
      .collection(CUSTOMERS_COLLECTION)
      .doc(uid)
      .collection("payments")
      .get();
    return snapshot.docs.map((doc) => doc.data() as PaymentRecord);
  }

  async listAllPayments(): Promise<PaymentRecord[]> {
    const customers = await this.firestore.collection(CUSTOMERS_COLLECTION).get();
    const results: PaymentRecord[] = [];
    for (const customer of customers.docs) {
      const payments = await customer.ref.collection("payments").get();
      payments.forEach((doc) => results.push(doc.data() as PaymentRecord));
    }
    return results;
  }
}
