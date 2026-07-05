export interface KSchoolEvent {
  id: string;
  index: number;
  createdAt: string;
  thumbnail: string;
  title: string;
  description: string;
  discountType: string;
  discountAmount: number;
  deadlineStart: string;
  deadlineEnd: string;
  useStart: string;
  useEnd: string;
}

export type CreateEventInput = Omit<KSchoolEvent, "id" | "createdAt">;
export type UpdateEventInput = Partial<CreateEventInput>;
