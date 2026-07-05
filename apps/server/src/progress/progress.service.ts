import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { Curriculum, CurriculumProgress } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { CurriculumService } from "../curriculum/curriculum.service";
import { calculateProgressPercent } from "./calculate-progress";

const PROGRESS_COLLECTION = "PROGRESS";

/**
 * FR-002/FR-008: a curriculum's lessons are only reachable by whoever
 * actually bought it. Mirrors the same products/customers Firestore lookup
 * payment/purchase-guard.ts already uses for "has this user paid" checks.
 */
@Injectable()
export class ProgressService {
  constructor(
    @Inject(FIRESTORE) private readonly firestore: Firestore,
    private readonly curriculumService: CurriculumService,
  ) {}

  private progressDocId(uid: string, curriculumId: string): string {
    return `${uid}_${curriculumId}`;
  }

  private async getProductIdForCurriculum(curriculumId: string): Promise<string> {
    const snapshot = await this.firestore
      .collection("products")
      .where("metadata.curriculumId", "==", curriculumId)
      .limit(1)
      .get();
    if (snapshot.empty) {
      throw new NotFoundException(`No product found for curriculum ${curriculumId}`);
    }
    return snapshot.docs[0].id;
  }

  private async assertPurchased(uid: string, curriculumId: string): Promise<void> {
    const productId = await this.getProductIdForCurriculum(curriculumId);
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

  private async readCompletedLessonIds(uid: string, curriculumId: string): Promise<string[]> {
    const doc = await this.firestore.collection(PROGRESS_COLLECTION).doc(this.progressDocId(uid, curriculumId)).get();
    return (doc.data()?.completedLessonIds as string[] | undefined) ?? [];
  }

  private toCurriculumProgress(curriculum: Curriculum, completedLessonIds: string[]): CurriculumProgress {
    const totalLessons = curriculum.lessons?.length ?? 0;
    const validCompleted = completedLessonIds.filter((lessonId) =>
      curriculum.lessons?.some((lesson) => lesson.id === lessonId),
    );
    return {
      curriculumId: curriculum.id,
      curriculumTitle: curriculum.title,
      completedLessonIds: validCompleted,
      totalLessons,
      percent: calculateProgressPercent(totalLessons, validCompleted.length),
    };
  }

  async getProgress(uid: string, curriculumId: string): Promise<CurriculumProgress> {
    await this.assertPurchased(uid, curriculumId);
    const curriculum = await this.curriculumService.get(curriculumId);
    const completedLessonIds = await this.readCompletedLessonIds(uid, curriculumId);
    return this.toCurriculumProgress(curriculum, completedLessonIds);
  }

  async setLessonComplete(
    uid: string,
    curriculumId: string,
    lessonId: string,
    completed: boolean,
  ): Promise<CurriculumProgress> {
    await this.assertPurchased(uid, curriculumId);
    const curriculum = await this.curriculumService.get(curriculumId);
    if (!curriculum.lessons?.some((lesson) => lesson.id === lessonId)) {
      throw new NotFoundException(`Lesson ${lessonId} not found on curriculum ${curriculumId}`);
    }

    const current = new Set(await this.readCompletedLessonIds(uid, curriculumId));
    if (completed) {
      current.add(lessonId);
    } else {
      current.delete(lessonId);
    }
    const completedLessonIds = Array.from(current);

    await this.firestore
      .collection(PROGRESS_COLLECTION)
      .doc(this.progressDocId(uid, curriculumId))
      .set({ uid, curriculumId, completedLessonIds, updatedAt: new Date().toISOString() }, { merge: true });

    return this.toCurriculumProgress(curriculum, completedLessonIds);
  }

  async listForUser(uid: string): Promise<CurriculumProgress[]> {
    const purchases = await this.firestore.collection("customers").doc(uid).collection("payments").get();
    if (purchases.empty) {
      return [];
    }

    const productIds = Array.from(new Set(purchases.docs.map((doc) => doc.data().productId as string)));
    const curriculumIds = new Set<string>();
    for (const productId of productIds) {
      const productDoc = await this.firestore.collection("products").doc(productId).get();
      const curriculumId = productDoc.data()?.metadata?.curriculumId as string | undefined;
      if (curriculumId) {
        curriculumIds.add(curriculumId);
      }
    }

    const results: CurriculumProgress[] = [];
    for (const curriculumId of curriculumIds) {
      const curriculum = await this.curriculumService.get(curriculumId);
      const completedLessonIds = await this.readCompletedLessonIds(uid, curriculumId);
      results.push(this.toCurriculumProgress(curriculum, completedLessonIds));
    }
    return results;
  }
}
