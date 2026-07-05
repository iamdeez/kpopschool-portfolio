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

  async create<TInput extends object>(data: TInput): Promise<Curriculum> {
    const teacherId = (data as { teacherId?: unknown }).teacherId;
    if (typeof teacherId !== "string") {
      throw new BadRequestException("teacherId is required");
    }
    await this.assertTeacherExists(teacherId);
    return super.create({ ...data, likes: 0, review: 0, student: 0, classes: [] });
  }

  async update<TInput extends object>(id: string, data: TInput): Promise<Curriculum> {
    const teacherId = (data as { teacherId?: unknown }).teacherId;
    if (typeof teacherId === "string") {
      await this.assertTeacherExists(teacherId);
    }
    return super.update(id, data);
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
