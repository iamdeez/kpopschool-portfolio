export interface Product {
  id: string;
  name: string;
  description: string;
  metadata: { curriculumId: string };
  price: { unitAmount: number; currency: string };
}

export interface PaymentRecord {
  id: string;
  uid: string;
  productId: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  curriculumId: string;
  unitAmount: number;
  currency: string;
}

export interface ChargeInput {
  uid: string;
  productId: string;
  paymentMethodId: string;
}

export interface ChargeResult {
  payment: PaymentRecord;
  status: "succeeded" | "requires_action" | "failed";
}
