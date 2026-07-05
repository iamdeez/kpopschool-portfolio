import type { Firestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import type { Lesson } from "@kpopschool/shared-types";

// A public-domain sample clip (no real licensed course content) reused across
// every seeded lesson — v1.1.0 FR-007/ASM-001.
const SAMPLE_LESSON_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

function buildLessons(totalSessions: number): Lesson[] {
  return Array.from({ length: totalSessions }, (_, i) => ({
    id: randomUUID(),
    title: `Lesson ${i + 1}`,
    order: i + 1,
    videoUrl: SAMPLE_LESSON_VIDEO_URL,
    durationMinutes: 15,
  }));
}

/**
 * FR-011/SC-011: populates every domain collection with enough representative
 * documents that the demo reads as a real, populated site (not "1 of
 * everything") — multiple teachers per category, multiple curriculums per
 * difficulty, and a product for every curriculum so "Buy this course" works
 * everywhere, not just on one hand-picked item.
 */
export async function seedDatabase(firestore: Firestore): Promise<{
  teacherIds: string[];
  curriculumIds: string[];
  productIds: string[];
}> {
  const now = new Date().toISOString();

  const teacherSeeds = [
    {
      category: "Vocal",
      name: "Jiwoo Han",
      career: "Former lead vocal coach at a major Seoul entertainment agency, 12+ years training debut idol vocalists.",
      rating: 4.9,
      review: 2,
      student: 34,
      profile: "https://i.pravatar.cc/400?img=47",
    },
    {
      category: "Vocal",
      name: "Minji Seo",
      career: "Session vocalist and vocal-run specialist, focuses on breath control and English pronunciation for global debuts.",
      rating: 4.7,
      review: 1,
      student: 19,
      profile: "https://i.pravatar.cc/400?img=32",
    },
    {
      category: "Dance",
      name: "Jinho Kang",
      career: "10+ years choreographing for K-pop idol groups, specializes in point choreography and stage formations.",
      rating: 4.8,
      review: 2,
      student: 41,
      profile: "https://i.pravatar.cc/400?img=13",
    },
    {
      category: "Dance",
      name: "Areum Choi",
      career: "Former backup dancer turned trainer, teaches sharp-line technique and camera-ready performance habits.",
      rating: 4.6,
      review: 1,
      student: 27,
      profile: "https://i.pravatar.cc/400?img=25",
    },
  ] as const;

  const teacherRefs = teacherSeeds.map((seed) => ({ seed, ref: firestore.collection("TEACHERS").doc() }));
  await Promise.all(
    teacherRefs.map(({ seed, ref }) =>
      ref.set({
        createdAt: now,
        category: seed.category,
        name: seed.name,
        career: seed.career,
        rating: seed.rating,
        review: seed.review,
        student: seed.student,
        profile: seed.profile,
      }),
    ),
  );

  const teacherByName = (name: string) => teacherRefs.find((t) => t.seed.name === name)!.ref;

  const curriculumSeeds = [
    {
      title: "K-Pop Vocal Fundamentals",
      teacher: "Jiwoo Han",
      category: "Vocal",
      format: "1:1",
      difficulty: "Beginner",
      totalSessions: 8,
      price: 12000,
      image: "https://picsum.photos/seed/vocal-beginner/600/400",
      description: "An 8-session beginner-friendly vocal course covering breath support, pitch, and tone.",
    },
    {
      title: "Vocal Runs & Ad-libs Intensive",
      teacher: "Minji Seo",
      category: "Vocal",
      format: "1:1",
      difficulty: "Intermediate",
      totalSessions: 10,
      price: 15000,
      image: "https://picsum.photos/seed/vocal-intermediate/600/400",
      description: "10 sessions building agile vocal runs, ad-libs, and stylistic phrasing for K-pop vocal lines.",
    },
    {
      title: "Pre-Debut Vocal Coaching",
      teacher: "Jiwoo Han",
      category: "Vocal",
      format: "1:1",
      difficulty: "Advanced",
      totalSessions: 12,
      price: 19000,
      image: "https://picsum.photos/seed/vocal-advanced/600/400",
      description: "Advanced 1:1 coaching for trainees preparing for agency evaluations and debut showcases.",
    },
    {
      title: "K-Pop Dance Fundamentals",
      teacher: "Jinho Kang",
      category: "Dance",
      format: "1:1",
      difficulty: "Beginner",
      totalSessions: 8,
      price: 12000,
      image: "https://picsum.photos/seed/dance-beginner/600/400",
      description: "An 8-session beginner-friendly K-pop dance course covering basic isolations and choreography.",
    },
    {
      title: "Point Choreography Workshop",
      teacher: "Areum Choi",
      category: "Dance",
      format: "1:6",
      difficulty: "Intermediate",
      totalSessions: 6,
      price: 9000,
      image: "https://picsum.photos/seed/dance-intermediate/600/400",
      description: "Small-group sessions drilling the signature 'point choreography' moves from popular title tracks.",
    },
    {
      title: "Stage-Ready Performance Lab",
      teacher: "Jinho Kang",
      category: "Dance",
      format: "1:1",
      difficulty: "Advanced",
      totalSessions: 10,
      price: 18000,
      image: "https://picsum.photos/seed/dance-advanced/600/400",
      description: "Advanced formation, facial expression, and camera-work training for stage and broadcast readiness.",
    },
  ] as const;

  const curriculumRefs = curriculumSeeds.map((seed) => ({ seed, ref: firestore.collection("CURRICULUMS").doc() }));
  await Promise.all(
    curriculumRefs.map(({ seed, ref }) =>
      ref.set({
        title: seed.title,
        image: seed.image,
        createdAt: now,
        teacherId: teacherByName(seed.teacher).id,
        category: seed.category,
        format: seed.format,
        month: 1,
        totalSessions: seed.totalSessions,
        lessons: buildLessons(seed.totalSessions),
        price: seed.price,
        description: seed.description,
        difficulty: seed.difficulty,
        likes: Math.floor(seed.price / 1000),
        review: 1,
        student: Math.floor(seed.price / 500),
        classes: [],
      }),
    ),
  );

  const curriculumByTitle = (title: string) => curriculumRefs.find((c) => c.seed.title === title)!.ref;

  const eventSeeds = [
    {
      title: "Welcome discount",
      description: "10% off your first booking.",
      discountAmount: 10,
      thumbnail: "https://picsum.photos/seed/event-welcome/600/300",
    },
    {
      title: "Summer vocal camp",
      description: "Book 3 vocal sessions, get 1 free.",
      discountAmount: 25,
      thumbnail: "https://picsum.photos/seed/event-summer/600/300",
    },
    {
      title: "Referral bonus",
      description: "Refer a friend and both get 15% off.",
      discountAmount: 15,
      thumbnail: "https://picsum.photos/seed/event-referral/600/300",
    },
  ];
  await Promise.all(
    eventSeeds.map((seed, index) =>
      firestore
        .collection("EVENTS")
        .doc()
        .set({
          index,
          createdAt: now,
          thumbnail: seed.thumbnail,
          title: seed.title,
          description: seed.description,
          discountType: "percentage",
          discountAmount: seed.discountAmount,
          deadlineStart: now,
          deadlineEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          useStart: now,
          useEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
        }),
    ),
  );

  const faqSeeds = [
    { question: "Can I cancel a booked lesson?", answer: "Yes, up to 24 hours before the scheduled session." },
    { question: "Do I need my own equipment?", answer: "Just a webcam and microphone — no special equipment required." },
    { question: "Can I switch teachers mid-course?", answer: "Yes, contact support and we'll help you transfer your remaining sessions." },
    { question: "Is there a free trial?", answer: "The demo account lets you explore every flow without booking a real paid session." },
  ];
  await Promise.all(
    faqSeeds.map((seed, index) =>
      firestore.collection("FAQ").doc().set({ index, createdAt: now, question: seed.question, answer: seed.answer }),
    ),
  );

  const reviewSeeds = [
    { teacher: "Jinho Kang", curriculum: "K-Pop Dance Fundamentals", rating: 5, comment: "Great first class, very encouraging teacher!" },
    { teacher: "Jinho Kang", curriculum: "Stage-Ready Performance Lab", rating: 5, comment: "Pushed me hard but my stage presence improved so much." },
    { teacher: "Jiwoo Han", curriculum: "K-Pop Vocal Fundamentals", rating: 5, comment: "Finally understand breath support — huge difference in 8 sessions." },
    { teacher: "Minji Seo", curriculum: "Vocal Runs & Ad-libs Intensive", rating: 4, comment: "Challenging but rewarding, runs are much cleaner now." },
    { teacher: "Areum Choi", curriculum: "Point Choreography Workshop", rating: 5, comment: "Loved the small group energy, learned two title-track routines." },
  ];
  await Promise.all(
    reviewSeeds.map((seed) =>
      firestore
        .collection("REVIEW")
        .doc()
        .set({
          createdAt: now,
          teacherId: teacherByName(seed.teacher).id,
          userId: "seed-user",
          curriculumId: curriculumByTitle(seed.curriculum).id,
          rating: seed.rating,
          comment: seed.comment,
        }),
    ),
  );

  await firestore.collection("HOME").doc().set({
    createdAt: now,
    bannerTitle: "Learn K-Pop Dance & Vocal Online",
    bannerImage: "https://picsum.photos/seed/kpopschool-banner/1200/400",
  });

  const productRefs = curriculumRefs.map(({ seed, ref }) => ({
    seed,
    curriculumRef: ref,
    productRef: firestore.collection("products").doc(),
  }));
  await Promise.all(
    productRefs.map(({ seed, curriculumRef, productRef }) =>
      productRef.set({
        id: productRef.id,
        name: seed.title,
        description: seed.description,
        metadata: { curriculumId: curriculumRef.id },
        price: { unitAmount: seed.price, currency: "usd" },
      }),
    ),
  );

  return {
    teacherIds: teacherRefs.map((t) => t.ref.id),
    curriculumIds: curriculumRefs.map((c) => c.ref.id),
    productIds: productRefs.map((p) => p.productRef.id),
  };
}
