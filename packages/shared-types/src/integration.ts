export type IntegrationMode = "demo" | "real";

export interface VideoClassSession {
  joinUrl: string;
  meetingNumber: string;
  signature: string;
  isMock: boolean;
}
