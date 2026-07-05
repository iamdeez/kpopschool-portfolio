import { randomUUID } from "node:crypto";

/**
 * Minimal in-memory stand-in for firebase-admin's Firestore, covering only
 * the surface our services actually call (collection/doc/get/set/add/delete,
 * single-field equality `where`). Good enough for unit tests; anything
 * needing real Firestore semantics belongs in an integration test against
 * the Firebase emulator instead.
 */
export class FakeFirestore {
  private readonly store = new Map<string, Map<string, Record<string, unknown>>>();

  collection(name: string) {
    if (!this.store.has(name)) {
      this.store.set(name, new Map());
    }
    const docs = this.store.get(name)!;

    const self = this;

    return {
      doc(id?: string) {
        const docId = id ?? randomUUID();
        return {
          id: docId,
          async get() {
            const data = docs.get(docId);
            return {
              exists: data !== undefined,
              id: docId,
              data: () => data,
            };
          },
          async set(data: Record<string, unknown>, opts?: { merge?: boolean }) {
            const existing = opts?.merge ? docs.get(docId) ?? {} : {};
            docs.set(docId, { ...existing, ...data });
          },
          async delete() {
            docs.delete(docId);
          },
          collection(subName: string) {
            return self.collection(`${name}/${docId}/${subName}`);
          },
        };
      },
      async add(data: Record<string, unknown>) {
        const id = randomUUID();
        docs.set(id, data);
        return { id };
      },
      async get() {
        const entries = Array.from(docs.entries());
        return {
          empty: entries.length === 0,
          docs: entries.map(([id, data]) => ({
            id,
            data: () => data,
            ref: { collection: (subName: string) => self.collection(`${name}/${id}/${subName}`) },
          })),
        };
      },
      where(field: string, op: "==", value: unknown) {
        if (op !== "==") {
          throw new Error(`FakeFirestore only supports '==', got '${op}'`);
        }
        return {
          async get() {
            const entries = Array.from(docs.entries()).filter(([, data]) => data[field] === value);
            return {
              docs: entries.map(([id, data]) => ({
                id,
                data: () => data,
                ref: { collection: (subName: string) => self.collection(`${name}/${id}/${subName}`) },
              })),
            };
          },
        };
      },
    };
  }

  // Mirrors real Firestore's collectionGroup: finds every subcollection
  // named `subName` regardless of which parent document it hangs off —
  // subcollections are stored under flat keys like "customers/{uid}/payments".
  collectionGroup(subName: string) {
    const store = this.store;
    return {
      async get() {
        const matchingKeys = Array.from(store.keys()).filter((key) => key === subName || key.endsWith(`/${subName}`));
        const docs = matchingKeys.flatMap((key) =>
          Array.from(store.get(key)!.entries()).map(([id, data]) => ({ id, data: () => data })),
        );
        return { empty: docs.length === 0, docs };
      },
    };
  }
}
