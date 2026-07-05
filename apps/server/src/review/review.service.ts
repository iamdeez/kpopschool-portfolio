import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { Review } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { FirestoreCrudService } from "../common/firestore-crud.service";

@Injectable()
export class ReviewService extends FirestoreCrudService<Review> {
  constructor(@Inject(FIRESTORE) firestore: Firestore) {
    super(firestore, "REVIEW");
  }

  private async assertReferencesExist(teacherId: string, curriculumId: string): Promise<void> {
    const [teacherDoc, curriculumDoc] = await Promise.all([
      this.firestore.collection("TEACHERS").doc(teacherId).get(),
      this.firestore.collection("CURRICULUMS").doc(curriculumId).get(),
    ]);
    if (!teacherDoc.exists) {
      throw new BadRequestException(`teacherId ${teacherId} does not reference an existing teacher`);
    }
    if (!curriculumDoc.exists) {
      throw new BadRequestException(
        `curriculumId ${curriculumId} does not reference an existing curriculum`,
      );
    }
  }

  /** Recomputes Teacher.rating/review from all reviews naively (fine at demo scale). */
  private async recalculateTeacherAggregate(teacherId: string): Promise<void> {
    const snapshot = await this.collection.where("teacherId", "==", teacherId).get();
    const ratings = snapshot.docs.map((doc) => doc.data().rating as number);
    const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    await this.firestore.collection("TEACHERS").doc(teacherId).set(
      { rating: Number(average.toFixed(2)), review: ratings.length },
      { merge: true },
    );
  }

  async create<TInput extends object>(data: TInput): Promise<Review> {
    const { teacherId, curriculumId, userId } = data as {
      teacherId?: unknown;
      curriculumId?: unknown;
      userId?: unknown;
    };
    if (
      typeof teacherId !== "string" ||
      typeof curriculumId !== "string" ||
      typeof userId !== "string"
    ) {
      throw new BadRequestException("teacherId, curriculumId and userId are required");
    }
    await this.assertReferencesExist(teacherId, curriculumId);
    const created = await super.create(data);
    await this.recalculateTeacherAggregate(teacherId);
    return created;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.get(id);
    await super.delete(id);
    await this.recalculateTeacherAggregate(existing.teacherId);
  }
}
