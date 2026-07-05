import { NotFoundException } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";

/**
 * Thin CRUD wrapper shared by the simple reference-data domains
 * (Teacher/Curriculum/Event/Faq/Inquiry/Review). Domains with extra
 * invariants (e.g. cross-entity reference checks) override the relevant
 * method rather than fighting this base class.
 */
export abstract class FirestoreCrudService<T extends { id: string }> {
  protected constructor(
    protected readonly firestore: Firestore,
    protected readonly collectionName: string,
  ) {}

  protected get collection() {
    return this.firestore.collection(this.collectionName);
  }

  async list(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
  }

  async get(id: string): Promise<T> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException(`${this.collectionName} document ${id} not found`);
    }
    return { id: doc.id, ...doc.data() } as T;
  }

  // Generic (rather than `Record<string, unknown>`) so class-validator DTO
  // instances — which have no index signature — can be passed directly.
  async create<TInput extends object>(data: TInput): Promise<T> {
    const ref = await this.collection.add({
      ...data,
      createdAt: new Date().toISOString(),
    });
    return this.get(ref.id);
  }

  async update<TInput extends object>(id: string, data: TInput): Promise<T> {
    await this.get(id);
    await this.collection.doc(id).set({ ...data }, { merge: true });
    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    await this.get(id);
    await this.collection.doc(id).delete();
  }
}
