import type { VideoClassSession } from "@kpopschool/shared-types";

export const VIDEO_CLASS_PROVIDER = "VIDEO_CLASS_PROVIDER";

/** FR-002/FR-003/FR-005: Real Zoom SDK calls behind an interface swapped by INTEGRATION_MODE. */
export interface VideoClassProvider {
  createSession(curriculumId: string, uid: string): Promise<VideoClassSession>;
}
