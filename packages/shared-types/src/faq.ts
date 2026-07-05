export interface Faq {
  id: string;
  index: number;
  createdAt: string;
  question: string;
  answer: string;
}

export type CreateFaqInput = Omit<Faq, "id" | "createdAt">;
export type UpdateFaqInput = Partial<CreateFaqInput>;
