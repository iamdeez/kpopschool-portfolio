import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { Curriculum, CurriculumProgress, QuizResult } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { CurriculumService } from "../curriculum/curriculum.service";
import { calculateProgressPercent, calculateQuizScore } from "./calculate-progress";

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

  private async readProgressDoc(
    uid: string,
    curriculumId: string,
  ): Promise<{ completedLessonIds: string[]; updatedAt: string | null }> {
    const doc = await this.firestore.collection(PROGRESS_COLLECTION).doc(this.progressDocId(uid, curriculumId)).get();
    const data = doc.data();
    return {
      completedLessonIds: (data?.completedLessonIds as string[] | undefined) ?? [],
      updatedAt: (data?.updatedAt as string | undefined) ?? null,
    };
  }

  // v1.2.0 ASM-003: completedAt is derived from the progress doc's last
  // write, not a separately-stored "first completed at" — so it only ever
  // reflects the certificate being currently earned (percent === 100), not
  // history from before an un-check dropped it back below 100.
  private toCurriculumProgress(
    curriculum: Curriculum,
    completedLessonIds: string[],
    updatedAt: string | null,
  ): CurriculumProgress {
    const totalLessons = curriculum.lessons?.length ?? 0;
    const validCompleted = completedLessonIds.filter((lessonId) =>
      curriculum.lessons?.some((lesson) => lesson.id === lessonId),
    );
    const percent = calculateProgressPercent(totalLessons, validCompleted.length);
    return {
      curriculumId: curriculum.id,
      curriculumTitle: curriculum.title,
      completedLessonIds: validCompleted,
      totalLessons,
      percent,
      completedAt: percent === 100 ? updatedAt : null,
    };
  }

  private async writeCompletedLessonIds(
    uid: string,
    curriculumId: string,
    completedLessonIds: string[],
  ): Promise<string> {
    const updatedAt = new Date().toISOString();
    await this.firestore
      .collection(PROGRESS_COLLECTION)
      .doc(this.progressDocId(uid, curriculumId))
      .set({ uid, curriculumId, completedLessonIds, updatedAt }, { merge: true });
    return updatedAt;
  }

  async getProgress(uid: string, curriculumId: string): Promise<CurriculumProgress> {
    await this.assertPurchased(uid, curriculumId);
    const curriculum = await this.curriculumService.get(curriculumId);
    const { completedLessonIds, updatedAt } = await this.readProgressDoc(uid, curriculumId);
    return this.toCurriculumProgress(curriculum, completedLessonIds, updatedAt);
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

    const { completedLessonIds: existing } = await this.readProgressDoc(uid, curriculumId);
    const current = new Set(existing);
    if (completed) {
      current.add(lessonId);
    } else {
      current.delete(lessonId);
    }
    const completedLessonIds = Array.from(current);
    const updatedAt = await this.writeCompletedLessonIds(uid, curriculumId, completedLessonIds);

    return this.toCurriculumProgress(curriculum, completedLessonIds, updatedAt);
  }

  // FR-003/FR-004: grades against the lesson's quiz and, on a passing score,
  // reuses the same completion bookkeeping setLessonComplete uses.
  async submitQuiz(uid: string, curriculumId: string, lessonId: string, answers: number[]): Promise<QuizResult> {
    await this.assertPurchased(uid, curriculumId);
    const curriculum = await this.curriculumService.get(curriculumId);
    const lesson = curriculum.lessons?.find((candidate) => candidate.id === lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found on curriculum ${curriculumId}`);
    }
    const quiz = lesson.quiz ?? [];
    if (quiz.length === 0) {
      throw new NotFoundException(`Lesson ${lessonId} has no quiz`);
    }

    const correctCount = quiz.filter((question, index) => answers[index] === question.correctOptionIndex).length;
    const { score, passed } = calculateQuizScore(quiz.length, correctCount);

    const { completedLessonIds: existing } = await this.readProgressDoc(uid, curriculumId);
    const current = new Set(existing);
    if (passed) {
      current.add(lessonId);
    }
    const completedLessonIds = Array.from(current);
    const updatedAt = await this.writeCompletedLessonIds(uid, curriculumId, completedLessonIds);

    return { score, passed, progress: this.toCurriculumProgress(curriculum, completedLessonIds, updatedAt) };
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
      const { completedLessonIds, updatedAt } = await this.readProgressDoc(uid, curriculumId);
      results.push(this.toCurriculumProgress(curriculum, completedLessonIds, updatedAt));
    }
    return results;
  }
}
