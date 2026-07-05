import { Inject, Injectable } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import { FIRESTORE } from "../common/firebase-admin.module";
import { FirestoreCrudService } from "../common/firestore-crud.service";
import type { HomeContent } from "./home-content.type";

@Injectable()
export class HomeService extends FirestoreCrudService<HomeContent> {
  constructor(@Inject(FIRESTORE) firestore: Firestore) {
    super(firestore, "HOME");
  }
}
