import { Inject, Injectable } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { Faq } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { FirestoreCrudService } from "../common/firestore-crud.service";

@Injectable()
export class FaqService extends FirestoreCrudService<Faq> {
  constructor(@Inject(FIRESTORE) firestore: Firestore) {
    super(firestore, "FAQ");
  }
}
