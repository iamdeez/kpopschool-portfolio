import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ChargeInput,
  ChargeResult,
  CreateCurriculumInput,
  CreateInquiryInput,
  CreateLessonCommentInput,
  CreateReviewInput,
  Curriculum,
  CurriculumProgress,
  Faq,
  Inquiry,
  KSchoolEvent,
  LessonComment,
  PaymentRecord,
  Product,
  QuizResult,
  ReportSummary,
  Review,
  Teacher,
  UpdateCurriculumInput,
  UpdateUserInput,
  User,
  VideoClassSession,
} from "@kpopschool/shared-types";
import { api } from "./client";

// --- Teachers -----------------------------------------------------------
export const useTeachers = () => useQuery({ queryKey: ["teachers"], queryFn: () => api.public.get<Teacher[]>("/teachers") });
export const useTeacher = (id: string) =>
  useQuery({ queryKey: ["teachers", id], queryFn: () => api.public.get<Teacher>(`/teachers/${id}`), enabled: !!id });

// --- Curriculums ----------------------------------------------------------
export const useCurriculums = () =>
  useQuery({ queryKey: ["curriculums"], queryFn: () => api.public.get<Curriculum[]>("/curriculums") });
export const useCurriculum = (id: string) =>
  useQuery({
    queryKey: ["curriculums", id],
    queryFn: () => api.public.get<Curriculum>(`/curriculums/${id}`),
    enabled: !!id,
  });
export const useCreateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCurriculumInput) => api.post<Curriculum>("/curriculums", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curriculums"] }),
  });
};
export const useUpdateCurriculum = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCurriculumInput) => api.patch<Curriculum>(`/curriculums/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curriculums"] }),
  });
};

// --- Events / FAQ (read-mostly catalog data) -----------------------------
export const useEvents = () => useQuery({ queryKey: ["events"], queryFn: () => api.public.get<KSchoolEvent[]>("/events") });
export const useFaqs = () => useQuery({ queryKey: ["faq"], queryFn: () => api.public.get<Faq[]>("/faq") });

// --- Reviews --------------------------------------------------------------
export const useReviews = () => useQuery({ queryKey: ["reviews"], queryFn: () => api.public.get<Review[]>("/review") });
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => api.post<Review>("/review", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
};

// --- Inquiries (1:1) --------------------------------------------------------
export const useMyInquiries = () => useQuery({ queryKey: ["inquiries", "me"], queryFn: () => api.get<Inquiry[]>("/inquiry/me") });
export const useCreateInquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInquiryInput) => api.post<Inquiry>("/inquiry", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inquiries", "me"] }),
  });
};

// --- Current user profile --------------------------------------------------
export const useUserProfile = (uid: string | undefined) =>
  useQuery({
    queryKey: ["users", uid],
    queryFn: () => api.get<User>(`/users/${uid}`),
    enabled: !!uid,
  });
export const useUpdateProfile = (uid: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) => api.patch<User>(`/users/${uid}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users", uid] }),
  });
};

// --- Payment ----------------------------------------------------------------
export const useProduct = (productId: string | undefined) =>
  useQuery({
    queryKey: ["products", productId],
    queryFn: () => api.public.get<Product>(`/payment/products/${productId}`),
    enabled: !!productId,
  });
export const useProductByCurriculum = (curriculumId: string | undefined) =>
  useQuery({
    queryKey: ["products", "by-curriculum", curriculumId],
    queryFn: () => api.public.get<Product>(`/payment/products/by-curriculum/${curriculumId}`),
    enabled: !!curriculumId,
    retry: false,
  });
export const useMyPayments = () => useQuery({ queryKey: ["payments", "me"], queryFn: () => api.get<PaymentRecord[]>("/payment/me") });

// The server derives `uid` from the authenticated request (payment.controller.ts),
// so the client never needs to — and must not be able to — supply someone else's uid.
type ChargeRequest = Omit<ChargeInput, "uid">;
export const useCharge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChargeRequest) => api.post<ChargeResult>("/payment/charge", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payments", "me"] }),
  });
};

// --- Video class ------------------------------------------------------------
export const useJoinVideoClass = () =>
  useMutation({
    mutationFn: (curriculumId: string) => api.post<VideoClassSession>("/video-class/join", { curriculumId }),
  });

// --- Lesson progress (v1.1.0) ------------------------------------------------
export const useCurriculumProgress = (curriculumId: string | undefined, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["progress", curriculumId],
    queryFn: () => api.get<CurriculumProgress>(`/progress/${curriculumId}`),
    enabled: !!curriculumId && (options?.enabled ?? true),
    retry: false,
  });
export const useMyProgress = () =>
  useQuery({ queryKey: ["progress", "me"], queryFn: () => api.get<CurriculumProgress[]>("/progress") });
export const useSetLessonComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ curriculumId, lessonId, completed }: { curriculumId: string; lessonId: string; completed: boolean }) =>
      api.post<CurriculumProgress>(`/progress/${curriculumId}/lessons/${lessonId}/complete`, { completed }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["progress", variables.curriculumId] });
      queryClient.invalidateQueries({ queryKey: ["progress", "me"] });
    },
  });
};

// --- Lesson quiz (v1.2.0) -----------------------------------------------------
export const useSubmitLessonQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ curriculumId, lessonId, answers }: { curriculumId: string; lessonId: string; answers: number[] }) =>
      api.post<QuizResult>(`/progress/${curriculumId}/lessons/${lessonId}/quiz-submit`, { answers }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["progress", variables.curriculumId] });
      queryClient.invalidateQueries({ queryKey: ["progress", "me"] });
    },
  });
};

// --- Demo login (FR-010) -----------------------------------------------------
export const useDemoLogin = () =>
  useMutation({
    mutationFn: () => api.public.post<{ token: string; uid: string }>("/demo/login"),
  });

// --- Admin reporting (v1.2.0) -------------------------------------------------
export const useReportSummary = () =>
  useQuery({ queryKey: ["reports", "summary"], queryFn: () => api.get<ReportSummary>("/admin/reports/summary") });

// --- Lesson discussion (v1.2.0) -----------------------------------------------
export const useLessonComments = (curriculumId: string | undefined, lessonId: string | undefined) =>
  useQuery({
    queryKey: ["comments", curriculumId, lessonId],
    queryFn: () => api.get<LessonComment[]>(`/comments/${curriculumId}/${lessonId}`),
    enabled: !!curriculumId && !!lessonId,
  });
export const useCreateLessonComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      curriculumId,
      lessonId,
      input,
    }: {
      curriculumId: string;
      lessonId: string;
      input: CreateLessonCommentInput;
    }) => api.post<LessonComment>(`/comments/${curriculumId}/${lessonId}`, input),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["comments", variables.curriculumId, variables.lessonId] }),
  });
};
export const useDeleteLessonComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ curriculumId, lessonId, commentId }: { curriculumId: string; lessonId: string; commentId: string }) =>
      api.delete(`/comments/${curriculumId}/${lessonId}/${commentId}`),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ["comments", variables.curriculumId, variables.lessonId] }),
  });
};
