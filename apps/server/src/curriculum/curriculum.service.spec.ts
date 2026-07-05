import { BadRequestException } from "@nestjs/common";
import { FakeFirestore } from "../testing/fake-firestore";
import { CurriculumService } from "./curriculum.service";

describe("CurriculumService", () => {
  it("rejects creating a curriculum that references a nonexistent teacher", async () => {
    const firestore = new FakeFirestore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = new CurriculumService(firestore as any);

    await expect(
      service.create({
        title: "Dance 101",
        image: "img",
        teacherId: "does-not-exist",
        category: "Dance",
        format: "1:1",
        month: 1,
        totalSessions: 8,
        lessons: [],
        price: 1000,
        description: "d",
        difficulty: "Beginner",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("creates a curriculum when the referenced teacher exists", async () => {
    const firestore = new FakeFirestore();
    await firestore.collection("TEACHERS").doc("teacher-1").set({ name: "Teacher One" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = new CurriculumService(firestore as any);

    const curriculum = await service.create({
      title: "Dance 101",
      image: "img",
      teacherId: "teacher-1",
      category: "Dance",
      format: "1:1",
      month: 1,
      totalSessions: 8,
      lessons: [],
      price: 1000,
      description: "d",
      difficulty: "Beginner",
    });

    expect(curriculum.teacherId).toBe("teacher-1");
    expect(curriculum.likes).toBe(0);
  });
});
