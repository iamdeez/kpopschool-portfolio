import { FakeFirestore } from "../testing/fake-firestore";
import { SEEDED_COLLECTIONS } from "../testing/seed-manifest";
import { seedDatabase } from "./seed-database";

describe("seedDatabase (FR-011/SC-011: demo never starts empty)", () => {
  it("writes at least one document to every collection in the seed manifest", async () => {
    const firestore = new FakeFirestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await seedDatabase(firestore as any);

    for (const collectionName of SEEDED_COLLECTIONS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snapshot = await (firestore as any).collection(collectionName).get();
      expect(snapshot.docs.length).toBeGreaterThan(0);
    }
  });

  it("seeds multiple teachers/curriculums/products, not just one of each", async () => {
    const firestore = new FakeFirestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { teacherIds, curriculumIds, productIds } = await seedDatabase(firestore as any);

    expect(teacherIds.length).toBeGreaterThan(1);
    expect(curriculumIds.length).toBeGreaterThan(1);
    expect(productIds.length).toBe(curriculumIds.length);
  });

  it("cross-references stay consistent (curriculum -> teacher, product -> curriculum)", async () => {
    const firestore = new FakeFirestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { teacherIds, curriculumIds } = await seedDatabase(firestore as any);

    for (const curriculumId of curriculumIds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const curriculumDoc = await (firestore as any).collection("CURRICULUMS").doc(curriculumId).get();
      expect(teacherIds).toContain(curriculumDoc.data().teacherId);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productsSnapshot = await (firestore as any).collection("products").get();
    for (const doc of productsSnapshot.docs) {
      expect(curriculumIds).toContain(doc.data().metadata.curriculumId);
    }
  });
});
