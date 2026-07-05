import { Inject, Injectable } from "@nestjs/common";
import type { Firestore } from "firebase-admin/firestore";
import type { ReportSummary } from "@kpopschool/shared-types";
import { FIRESTORE } from "../common/firebase-admin.module";
import { CurriculumService } from "../curriculum/curriculum.service";
import { PAYMENT_GATEWAY, PaymentGateway } from "../payment/payment-gateway.interface";
import { calculateProgressPercent } from "../progress/calculate-progress";
import { averagePercent } from "./calculate-report-stats";

const PROGRESS_COLLECTION = "PROGRESS";

/** FR-001/FR-002: read-only aggregation over existing collections — no new state is written. */
@Injectable()
export class ReportingService {
  constructor(
    @Inject(FIRESTORE) private readonly firestore: Firestore,
    private readonly curriculumService: CurriculumService,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway,
  ) {}

  async getSummary(): Promise<ReportSummary> {
    const [usersSnapshot, teachersSnapshot, curriculums, payments, productsSnapshot] = await Promise.all([
      this.firestore.collection("USERS").get(),
      this.firestore.collection("TEACHERS").get(),
      this.curriculumService.list(),
      this.paymentGateway.listAllPayments(),
      this.firestore.collection("products").get(),
    ]);

    const curriculumIdByProductId = new Map<string, string>();
    productsSnapshot.docs.forEach((doc) => {
      const curriculumId = doc.data()?.metadata?.curriculumId as string | undefined;
      if (curriculumId) {
        curriculumIdByProductId.set(doc.id, curriculumId);
      }
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    const purchaseCountByCurriculum = new Map<string, number>();
    for (const payment of payments) {
      const curriculumId = curriculumIdByProductId.get(payment.productId);
      if (!curriculumId) {
        continue;
      }
      purchaseCountByCurriculum.set(curriculumId, (purchaseCountByCurriculum.get(curriculumId) ?? 0) + 1);
    }

    const curriculumStats = await Promise.all(
      curriculums.map(async (curriculum) => {
        const progressSnapshot = await this.firestore
          .collection(PROGRESS_COLLECTION)
          .where("curriculumId", "==", curriculum.id)
          .get();
        const totalLessons = curriculum.lessons?.length ?? 0;
        const percents = progressSnapshot.docs.map((doc) =>
          calculateProgressPercent(totalLessons, ((doc.data().completedLessonIds as string[] | undefined) ?? []).length),
        );
        return {
          curriculumId: curriculum.id,
          curriculumTitle: curriculum.title,
          purchaseCount: purchaseCountByCurriculum.get(curriculum.id) ?? 0,
          averageProgressPercent: averagePercent(percents),
        };
      }),
    );

    return {
      totalRevenue,
      totalStudents: usersSnapshot.size,
      totalTeachers: teachersSnapshot.size,
      totalCurriculums: curriculums.length,
      curriculumStats,
    };
  }
}
