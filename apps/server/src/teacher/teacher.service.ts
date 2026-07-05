import { Inject, Injectable } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { Teacher } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { FirestoreCrudService } from "../common/firestore-crud.service";

@Injectable()
export class TeacherService extends FirestoreCrudService<Teacher> {
  constructor(@Inject(FIRESTORE) firestore: Firestore) {
    super(firestore, "TEACHERS");
  }

  async create<TInput extends object>(data: TInput): Promise<Teacher> {
    return super.create({ ...data, rating: 0, review: 0, student: 0 });
  }

  async search(keyword: string): Promise<Teacher[]> {
    const all = await this.list();
    const needle = keyword.trim().toLowerCase();
    return all.filter(
      (teacher) =>
        teacher.name?.toLowerCase().includes(needle) ||
        teacher.category?.toLowerCase().includes(needle),
    );
  }
}
