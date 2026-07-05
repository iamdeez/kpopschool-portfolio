import { Inject, Injectable } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { KSchoolEvent } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { FirestoreCrudService } from "../common/firestore-crud.service";

@Injectable()
export class EventService extends FirestoreCrudService<KSchoolEvent> {
  constructor(@Inject(FIRESTORE) firestore: Firestore) {
    super(firestore, "EVENTS");
  }
}
