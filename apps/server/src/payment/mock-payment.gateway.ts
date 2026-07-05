import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import type {
  ChargeInput,
  ChargeResult,
  CreateProductInput,
  PaymentRecord,
  Product,
} from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import type { PaymentGateway } from "./payment-gateway.interface";
import { assertNotAlreadyPurchased } from "./purchase-guard";

const PRODUCTS_COLLECTION = "products";
const CUSTOMERS_COLLECTION = "customers";

/**
 * SC-004: visitors complete "add card -> buy -> view history" without any
 * real charge. Firestore is still real (so admin CRUD/demo data behave
 * identically to real mode) — only the Stripe network call is skipped.
 */
@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  async createProduct(input: CreateProductInput): Promise<Product> {
    const id = `mock_prod_${randomUUID()}`;
    const record: Product = {
      id,
      name: input.name,
      description: input.description,
      metadata: { curriculumId: input.curriculumId },
      price: { unitAmount: input.unitAmount, currency: input.currency },
    };
    await this.firestore.collection(PRODUCTS_COLLECTION).doc(id).set(record);
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

    const payment: PaymentRecord = {
      id: `mock_pi_${randomUUID()}`,
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
      .doc(payment.id)
      .set(payment);

    return { payment, status: "succeeded" };
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
