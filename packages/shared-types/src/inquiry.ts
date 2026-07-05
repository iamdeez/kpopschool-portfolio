export type InquiryState = "pending" | "answered" | "closed";

export interface Inquiry {
  id: string;
  uid: string;
  createdAt: string;
  tag: string;
  date: string;
  state: InquiryState;
  title: string;
  details: string;
}

export type CreateInquiryInput = Omit<Inquiry, "id" | "createdAt" | "state"> & {
  state?: InquiryState;
};
export type UpdateInquiryInput = Partial<Omit<Inquiry, "id" | "uid" | "createdAt">>;
