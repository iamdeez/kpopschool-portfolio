import type { ChargeInput, ChargeResult, CreateProductInput, PaymentRecord, Product } from "@kpopschool/shared-types";

export const PAYMENT_GATEWAY = "PAYMENT_GATEWAY";

/**
 * FR-002/FR-003: one interface, two implementations. NestJS DI picks the
 * implementation at boot based on INTEGRATION_MODE — call sites never
 * branch on mode themselves.
 */
export interface PaymentGateway {
  createProduct(input: CreateProductInput): Promise<Product>;
  getProduct(productId: string): Promise<Product>;
  charge(input: ChargeInput): Promise<ChargeResult>;
  listPayments(uid: string): Promise<PaymentRecord[]>;
  listAllPayments(): Promise<PaymentRecord[]>;
}
