import { NotFoundException } from "@nestjs/common";
import { FakeFirestore } from "../testing/fake-firestore";
import { MockPaymentGateway } from "./mock-payment.gateway";

describe("MockPaymentGateway", () => {
  function makeGateway() {
    const firestore = new FakeFirestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new MockPaymentGateway(firestore as any);
  }

  it("charges the exact product price, including a zero-amount product (SC-013 boundary)", async () => {
    const gateway = makeGateway();
    const product = await gateway.createProduct({
      name: "Free trial session",
      description: "0-cost boundary case",
      curriculumId: "curriculum-1",
      unitAmount: 0,
      currency: "usd",
    });

    const result = await gateway.charge({
      uid: "user-1",
      productId: product.id,
      paymentMethodId: "pm_mock",
    });

    expect(result.status).toBe("succeeded");
    expect(result.payment.amount).toBe(0);
  });

  it("charges a normal-priced product and records it under the user's payment history", async () => {
    const gateway = makeGateway();
    const product = await gateway.createProduct({
      name: "K-Pop Dance Fundamentals",
      description: "8 sessions",
      curriculumId: "curriculum-2",
      unitAmount: 12000,
      currency: "usd",
    });

    const result = await gateway.charge({
      uid: "user-2",
      productId: product.id,
      paymentMethodId: "pm_mock",
    });

    expect(result.payment.amount).toBe(12000);
    const history = await gateway.listPayments("user-2");
    expect(history).toHaveLength(1);
    expect(history[0].productId).toBe(product.id);
  });

  it("rejects a second purchase of the same product by the same user (예약 가능 여부 판정, SC-013)", async () => {
    const gateway = makeGateway();
    const product = await gateway.createProduct({
      name: "K-Pop Dance Fundamentals",
      description: "8 sessions",
      curriculumId: "curriculum-3",
      unitAmount: 12000,
      currency: "usd",
    });

    await gateway.charge({ uid: "user-3", productId: product.id, paymentMethodId: "pm_mock" });

    await expect(
      gateway.charge({ uid: "user-3", productId: product.id, paymentMethodId: "pm_mock" }),
    ).rejects.toThrow("already been purchased");
  });

  it("throws NotFoundException when charging a nonexistent product", async () => {
    const gateway = makeGateway();
    await expect(
      gateway.charge({ uid: "user-4", productId: "does-not-exist", paymentMethodId: "pm_mock" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  // v1.2.0 regression: writing to customers/{uid}/payments never creates a
  // customers/{uid} document with actual fields, so a naive
  // `customers.get()` + per-doc subcollection read finds zero payments in
  // real Firestore even though the subcollection docs exist — only a
  // collectionGroup query sees them. This test uses two different uids
  // specifically so a "read the payments subcollection of the first
  // customer doc I happen to find" bug wouldn't accidentally pass by only
  // ever looking at one user.
  it("lists every payment across every customer (v1.2.0 admin reporting)", async () => {
    const gateway = makeGateway();
    const product = await gateway.createProduct({
      name: "K-Pop Dance Fundamentals",
      description: "8 sessions",
      curriculumId: "curriculum-5",
      unitAmount: 12000,
      currency: "usd",
    });

    await gateway.charge({ uid: "user-5", productId: product.id, paymentMethodId: "pm_mock" });
    await gateway.charge({ uid: "user-6", productId: product.id, paymentMethodId: "pm_mock" });

    const all = await gateway.listAllPayments();
    expect(all).toHaveLength(2);
    expect(all.map((payment) => payment.uid).sort()).toEqual(["user-5", "user-6"]);
  });
});
