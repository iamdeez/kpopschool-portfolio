import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { LessonComment } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { assertOwner } from "../auth/ownership";
import type { AuthenticatedUser } from "../auth/firebase-auth.guard";

const COMMENTS_COLLECTION = "LESSON_COMMENTS";

/**
 * FR-002/FR-003: reading a lesson's discussion is public to any logged-in
 * user (it's meant to work like a course preview), but posting requires
 * having actually purchased the curriculum — same products/customers
 * Firestore lookup progress.service.ts uses for the same purpose.
 */
@Injectable()
export class CommentService {
  constructor(@Inject(FIRESTORE) private readonly firestore: Firestore) {}

  private async assertPurchased(uid: string, curriculumId: string): Promise<void> {
    const productSnapshot = await this.firestore
      .collection("products")
      .where("metadata.curriculumId", "==", curriculumId)
      .limit(1)
      .get();
    if (productSnapshot.empty) {
      throw new NotFoundException(`No product found for curriculum ${curriculumId}`);
    }
    const productId = productSnapshot.docs[0].id;

    const purchases = await this.firestore
      .collection("customers")
      .doc(uid)
      .collection("payments")
      .where("productId", "==", productId)
      .limit(1)
      .get();
    if (purchases.empty) {
      throw new ForbiddenException("You have not purchased this curriculum");
    }
  }

  async list(curriculumId: string, lessonId: string): Promise<LessonComment[]> {
    const snapshot = await this.firestore
      .collection(COMMENTS_COLLECTION)
      .where("curriculumId", "==", curriculumId)
      .get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as LessonComment)
      .filter((comment) => comment.lessonId === lessonId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async create(
    uid: string,
    authorEmail: string,
    curriculumId: string,
    lessonId: string,
    body: string,
  ): Promise<LessonComment> {
    await this.assertPurchased(uid, curriculumId);
    const comment = {
      curriculumId,
      lessonId,
      uid,
      authorEmail,
      body,
      createdAt: new Date().toISOString(),
    };
    const ref = await this.firestore.collection(COMMENTS_COLLECTION).add(comment);
    return { id: ref.id, ...comment };
  }

  async remove(user: AuthenticatedUser, commentId: string): Promise<void> {
    const doc = await this.firestore.collection(COMMENTS_COLLECTION).doc(commentId).get();
    if (!doc.exists) {
      throw new NotFoundException(`Comment ${commentId} not found`);
    }
    const comment = doc.data() as LessonComment;
    assertOwner(user, comment.uid);
    await doc.ref.delete();
  }
}
