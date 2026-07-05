import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import type { User } from "@kpopschool/shared-types";
import { FIREBASE_ADMIN, FIRESTORE } from "../common/firebase-admin.module";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

const COLLECTION = "USERS";

@Injectable()
export class UserService {
  constructor(
    @Inject(FIRESTORE) private readonly firestore: Firestore,
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: admin.app.App,
  ) {}

  private get collection() {
    return this.firestore.collection(COLLECTION);
  }

  /**
   * Registration writes the Firestore profile keyed by the Firebase Auth uid
   * (not an auto-id) so the two records can never drift apart. The document
   * never receives a `password` field — see shared-types User (FR-013).
   */
  async register(dto: CreateUserDto): Promise<User> {
    let userRecord;
    try {
      userRecord = await this.firebaseApp.auth().createUser({
        email: dto.email,
        password: dto.password,
        displayName: dto.name,
      });
    } catch (error) {
      throw new ConflictException((error as Error).message);
    }

    const { password: _password, ...profileFields } = dto;
    void _password;

    const profile = {
      ...profileFields,
      profile: "",
      frequency: "",
      isTeacher: false,
      classes: [],
      interestClass: [],
      interestTeacher: [],
      createdAt: new Date().toISOString(),
    };

    try {
      await this.collection.doc(userRecord.uid).set(profile);
    } catch (error) {
      // Don't leave an orphaned Auth user with no Firestore profile behind —
      // a partial failure here previously left the account unusable and the
      // email permanently claimed, requiring manual emulator/console cleanup.
      await this.firebaseApp.auth().deleteUser(userRecord.uid).catch(() => undefined);
      throw error;
    }
    return { id: userRecord.uid, ...profile } as User;
  }

  async findAll(): Promise<User[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);
  }

  async findOne(id: string): Promise<User> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return { id: doc.id, ...doc.data() } as User;
  }

  async search(keyword: string): Promise<User[]> {
    const all = await this.findAll();
    const needle = keyword.trim().toLowerCase();
    return all.filter((user) => user.name?.toLowerCase().includes(needle));
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id);
    await this.collection.doc(id).set(dto, { merge: true });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.collection.doc(id).delete();
    await this.firebaseApp.auth().deleteUser(id).catch(() => undefined);
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    await this.firebaseApp.auth().updateUser(id, { password: newPassword });
  }
}
