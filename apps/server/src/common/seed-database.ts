import type { Firestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import type { Lesson } from "@kpopschool/shared-types";
import { seedPhoto, labelThumbnail } from "./placeholder-image";

// Mirrors apps/web/src/theme.ts's brand palette (kept as a plain literal
// here rather than a shared import — this is server-only seed data, not
// something the web app's theme module should be imported into).
const BRAND = { popyellow: "#FFCC00", popblue: "#00B2FF", popmint: "#00C3BA", popmag: "#FF3CA2" };

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
    // v1.2.0 FR-001/ASM-001: every curriculum's first lesson ships with a
    // sample quiz so the quiz→auto-complete→certificate flow is demoable
    // without an admin manually adding one first.
    ...(i === 0
      ? {
          quiz: [
            {
              id: randomUUID(),
              question: "What should you warm up before a lesson?",
              options: ["Your voice/body", "Your phone battery", "Your Wi-Fi router", "Nothing"],
              correctOptionIndex: 0,
            },
            {
              id: randomUUID(),
              question: "How often should you practice between lessons?",
              options: ["Never", "Only the night before", "A little, regularly", "Only when inspired"],
              correctOptionIndex: 2,
            },
          ],
        }
      : {}),
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
      career:
        "Spent 12 years as lead vocal coach inside a Seoul entertainment agency's trainee program, shaping the vocal lines for three separate debut groups before moving to 1:1 coaching full-time.",
      rating: 4.9,
      review: 2,
      student: 34,
      photo: "teacher-jiwoo-han.webp",
    },
    {
      category: "Vocal",
      name: "Minji Seo",
      career:
        "Session vocalist for indie and idol releases alike, with a reputation for turning shaky ad-libs into clean, confident runs. Also coaches English pronunciation for trainees prepping for global promotion.",
      rating: 4.7,
      review: 1,
      student: 19,
      photo: "teacher-minji-seo.webp",
    },
    {
      category: "Dance",
      name: "Jinho Kang",
      career:
        "Choreographed point moves and stage formations for K-pop idol groups for over a decade — the kind of 8-count everyone in the fandom ends up learning from a fancam. Now teaches the same formation drills 1:1.",
      rating: 4.8,
      review: 2,
      student: 41,
      photo: "teacher-jinho-kang.webp",
    },
    {
      category: "Dance",
      name: "Areum Choi",
      career:
        "Started as a backup dancer touring with multiple idol acts, then pivoted to teaching — she's the trainer people come back to for sharp lines, clean transitions, and camera-ready habits that hold up on a broadcast stage.",
      rating: 4.6,
      review: 1,
      student: 27,
      photo: "teacher-areum-choi.webp",
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
        profile: seedPhoto(seed.photo),
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
      image: labelThumbnail("Vocal · Beginner", BRAND.popmint),
      description:
        "Start from wherever you are — breath support, pitch accuracy, and tone control, taught the way a debut trainee actually learns them. No prior vocal training needed.",
    },
    {
      title: "Vocal Runs & Ad-libs Intensive",
      teacher: "Minji Seo",
      category: "Vocal",
      format: "1:1",
      difficulty: "Intermediate",
      totalSessions: 10,
      price: 15000,
      image: labelThumbnail("Vocal · Intermediate", BRAND.popmint),
      description:
        "Turn stiff runs into agile ones. Built around the ad-libs and stylistic phrasing that separate a good K-pop vocal line from a forgettable one.",
    },
    {
      title: "Pre-Debut Vocal Coaching",
      teacher: "Jiwoo Han",
      category: "Vocal",
      format: "1:1",
      difficulty: "Advanced",
      totalSessions: 12,
      price: 19000,
      image: labelThumbnail("Vocal · Advanced", BRAND.popmint),
      description:
        "For trainees with an agency evaluation or debut showcase on the calendar. Twelve sessions of the exact scrutiny a live panel gives you, minus the nerves.",
    },
    {
      title: "K-Pop Dance Fundamentals",
      teacher: "Jinho Kang",
      category: "Dance",
      format: "1:1",
      difficulty: "Beginner",
      totalSessions: 8,
      price: 12000,
      image: labelThumbnail("Dance · Beginner", BRAND.popmag),
      description:
        "Isolations, counts, and your first full choreography — the fundamentals every K-pop dance line is built on, taught 1:1 so nothing gets rushed.",
    },
    {
      title: "Point Choreography Workshop",
      teacher: "Areum Choi",
      category: "Dance",
      format: "1:6",
      difficulty: "Intermediate",
      totalSessions: 6,
      price: 9000,
      image: labelThumbnail("Dance · Intermediate", BRAND.popmag),
      description:
        "Small-group sessions built around the 'point choreography' moves fans learn from fancams — the handful of gestures a whole title track gets remembered by.",
    },
    {
      title: "Stage-Ready Performance Lab",
      teacher: "Jinho Kang",
      category: "Dance",
      format: "1:1",
      difficulty: "Advanced",
      totalSessions: 10,
      price: 18000,
      image: labelThumbnail("Dance · Advanced", BRAND.popmag),
      description:
        "Formation changes, facial expression, camera angles — the details that separate a rehearsal-room routine from one that holds up under broadcast lighting.",
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
      description: "New here? Your first booking is 10% off — on us, no code needed.",
      discountAmount: 10,
      thumbnail: labelThumbnail("Welcome", BRAND.popyellow, 600, 300),
    },
    {
      title: "Summer vocal camp",
      description: "Book any 3 vocal sessions this summer and the 4th is free — stackable across any vocal trainer.",
      discountAmount: 25,
      thumbnail: labelThumbnail("Summer Camp", BRAND.popmint, 600, 300),
    },
    {
      title: "Referral bonus",
      description: "Bring a friend into the studio — you both get 15% off your next course once they book their first lesson.",
      discountAmount: 15,
      thumbnail: labelThumbnail("Referral", BRAND.popblue, 600, 300),
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
    {
      question: "Can I cancel or reschedule a booked lesson?",
      answer:
        "Yes — cancel or move a session up to 24 hours before it starts, no fee. Inside 24 hours, reach out to your trainer directly and most are happy to work something out.",
    },
    {
      question: "Do I need my own equipment?",
      answer:
        "Just a webcam and a microphone — most laptops already have both built in. Vocal trainees sometimes upgrade to a USB mic later, but it's never required to start.",
    },
    {
      question: "Can I switch teachers partway through a course?",
      answer:
        "Yes. Message support and we'll transfer your remaining sessions to a new trainer in the same track — no penalty, and your progress carries over.",
    },
    {
      question: "What's the difference between 1:1, 1:6, and VOD?",
      answer:
        "1:1 is a private live session with your trainer. 1:6 is a small live group class, capped at six so everyone still gets real feedback. VOD is self-paced — watch, practice, and complete lessons on your own schedule.",
    },
    {
      question: "Do I get a certificate?",
      answer:
        "Every curriculum with a quiz issues a certificate once you've completed 100% of its lessons and passed each quiz — downloadable and printable from My Page.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Click \"Try the demo\" on the home page — it drops you straight into a full account (bookings, lessons, progress, the works) with no signup and no payment info.",
    },
  ];
  await Promise.all(
    faqSeeds.map((seed, index) =>
      firestore.collection("FAQ").doc().set({ index, createdAt: now, question: seed.question, answer: seed.answer }),
    ),
  );

  const reviewSeeds = [
    {
      teacher: "Jinho Kang",
      curriculum: "K-Pop Dance Fundamentals",
      rating: 5,
      comment: "Walked in with zero dance background. By lesson 4 I could actually follow an 8-count without stopping to think. Jinho notices the tiny stuff.",
    },
    {
      teacher: "Jinho Kang",
      curriculum: "Stage-Ready Performance Lab",
      rating: 5,
      comment: "This is where I stopped dancing like I was rehearsing and started dancing like I was being filmed. Worth it for the camera-angle feedback alone.",
    },
    {
      teacher: "Jiwoo Han",
      curriculum: "K-Pop Vocal Fundamentals",
      rating: 5,
      comment: "I'd been singing from my throat for years without knowing it. Eight sessions in, breath support finally clicked and my range opened up.",
    },
    {
      teacher: "Minji Seo",
      curriculum: "Vocal Runs & Ad-libs Intensive",
      rating: 4,
      comment: "Runs that used to sound muddy are actually clean now. Fair warning: Minji will make you repeat a 2-second phrase fifteen times if it's not right.",
    },
    {
      teacher: "Areum Choi",
      curriculum: "Point Choreography Workshop",
      rating: 5,
      comment: "Small-group energy made this — six of us pushing each other through the same eight counts until it clicked for everyone. Learned two full routines.",
    },
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
    bannerImage: labelThumbnail("Learn K-Pop Dance & Vocal Online", BRAND.popmag, 1200, 400),
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
