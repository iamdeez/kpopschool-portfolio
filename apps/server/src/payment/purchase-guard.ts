import { ConflictException } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";

/**
 * "예약 가능 여부 판정" (SC-013): a curriculum purchase is a booking, and a
 * visitor cannot re-book something they already hold a payment record for.
 * Shared by both PaymentGateway implementations so demo/real mode enforce
 * the same invariant.
 */
export async function assertNotAlreadyPurchased(
  firestore: Firestore,
  uid: string,
  productId: string,
): Promise<void> {
  const existing = await firestore
    .collection("customers")
    .doc(uid)
    .collection("payments")
    .where("productId", "==", productId)
    .get();

  if (!existing.docs.length) {
    return;
  }

  throw new ConflictException("This product has already been purchased by this user");
}
