import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { Inquiry } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { FirestoreCrudService } from "../common/firestore-crud.service";

@Injectable()
export class InquiryService extends FirestoreCrudService<Inquiry> {
  constructor(@Inject(FIRESTORE) firestore: Firestore) {
    super(firestore, "INQUIRY");
  }

  async create<TInput extends object>(data: TInput): Promise<Inquiry> {
    if (typeof (data as { uid?: unknown }).uid !== "string") {
      throw new BadRequestException("uid is required");
    }
    return super.create({ ...data, state: "pending" });
  }

  async listByUser(uid: string): Promise<Inquiry[]> {
    const snapshot = await this.collection.where("uid", "==", uid).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Inquiry);
  }

  async search(keyword: string): Promise<Inquiry[]> {
    const all = await this.list();
    const needle = keyword.trim().toLowerCase();
    return all.filter((inquiry) => inquiry.title?.toLowerCase().includes(needle));
  }
}
