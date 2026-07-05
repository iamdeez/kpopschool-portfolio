import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { Curriculum } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { FirestoreCrudService } from "../common/firestore-crud.service";

@Injectable()
export class CurriculumService extends FirestoreCrudService<Curriculum> {
  constructor(@Inject(FIRESTORE) firestore: Firestore) {
    super(firestore, "CURRICULUMS");
  }

  private async assertTeacherExists(teacherId: string): Promise<void> {
    const doc = await this.firestore.collection("TEACHERS").doc(teacherId).get();
    if (!doc.exists) {
      throw new BadRequestException(`teacherId ${teacherId} does not reference an existing teacher`);
    }
  }

  // ValidationPipe's `transform: true` turns `lessons` into an array of
  // LessonDto class instances (custom prototype), which the Firestore SDK
  // refuses to serialize. Spreading each entry back into a plain object
  // strips the prototype without changing its fields.
  private toPlainLessons<TInput extends object>(data: TInput): TInput {
    const lessons = (data as { lessons?: unknown }).lessons;
    if (!Array.isArray(lessons)) {
      return data;
    }
    return { ...data, lessons: lessons.map((lesson) => ({ ...lesson })) };
  }

  async create<TInput extends object>(data: TInput): Promise<Curriculum> {
    const teacherId = (data as { teacherId?: unknown }).teacherId;
    if (typeof teacherId !== "string") {
      throw new BadRequestException("teacherId is required");
    }
    await this.assertTeacherExists(teacherId);
    return super.create({ ...this.toPlainLessons(data), likes: 0, review: 0, student: 0, classes: [] });
  }

  async update<TInput extends object>(id: string, data: TInput): Promise<Curriculum> {
    const teacherId = (data as { teacherId?: unknown }).teacherId;
    if (typeof teacherId === "string") {
      await this.assertTeacherExists(teacherId);
    }
    return super.update(id, this.toPlainLessons(data));
  }

  async search(keyword: string): Promise<Curriculum[]> {
    const all = await this.list();
    const needle = keyword.trim().toLowerCase();
    return all.filter(
      (curriculum) =>
        curriculum.title?.toLowerCase().includes(needle) ||
        curriculum.category?.toLowerCase().includes(needle),
    );
  }
}
