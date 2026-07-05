import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Heading,
  Link as ChakraLink,
  Progress as ProgressBar,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import type { Lesson } from "@kpopschool/shared-types";
import {
  useCreateLessonComment,
  useCurriculum,
  useCurriculumProgress,
  useLessonComments,
  useSetLessonComplete,
  useSubmitLessonQuiz,
} from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";
import { popmag, popmint, brandLightGray } from "../theme";

/** v1.2.0 FR-002/FR-003: a lesson with a quiz replaces the manual checkbox — passing it is what marks the lesson complete. */
function LessonQuiz({ curriculumId, lesson }: { curriculumId: string; lesson: Lesson }) {
  const quiz = lesson.quiz ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const submitQuiz = useSubmitLessonQuiz();

  function handleSubmit() {
    const orderedAnswers = quiz.map((question) => Number(answers[question.id] ?? -1));
    submitQuiz.mutate({ curriculumId, lessonId: lesson.id, answers: orderedAnswers });
  }

  const allAnswered = quiz.every((question) => answers[question.id] !== undefined);

  return (
    <Stack spacing={4} mt={2}>
      <Text fontWeight="bold" color={popmint}>
        📝 Quiz
      </Text>
      {quiz.map((question, index) => (
        <Box key={question.id}>
          <Text fontWeight="600" mb={1}>
            {index + 1}. {question.question}
          </Text>
          <RadioGroup
            value={answers[question.id] ?? ""}
            onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
          >
            <Stack spacing={1}>
              {question.options.map((option, optionIndex) => (
                <Radio key={optionIndex} value={String(optionIndex)}>
                  {option}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </Box>
      ))}
      <Button
        alignSelf="flex-start"
        bgColor={popmag}
        color="white"
        _hover={{ opacity: 0.9 }}
        isDisabled={!allAnswered}
        isLoading={submitQuiz.isPending}
        onClick={handleSubmit}
      >
        Submit answers
      </Button>
      {submitQuiz.data && (
        <Box p={3} borderRadius="lg" bg={submitQuiz.data.passed ? "green.50" : "red.50"}>
          <Text color={submitQuiz.data.passed ? "green.700" : "red.700"} fontWeight="bold">
            Score: {submitQuiz.data.score}% — {submitQuiz.data.passed ? "Passed! Lesson marked complete." : "Not quite — try again."}
          </Text>
        </Box>
      )}
    </Stack>
  );
}

/** v1.2.0 FR-001/FR-002/FR-003: reading is public to any logged-in visitor; posting requires having purchased the course. */
function LessonDiscussion({
  curriculumId,
  lessonId,
  canPost,
}: {
  curriculumId: string;
  lessonId: string;
  canPost: boolean;
}) {
  const comments = useLessonComments(curriculumId, lessonId);
  const createComment = useCreateLessonComment();
  const [body, setBody] = useState("");

  function handlePost() {
    if (!body.trim()) {
      return;
    }
    createComment.mutate(
      { curriculumId, lessonId, input: { body } },
      { onSuccess: () => setBody("") },
    );
  }

  return (
    <Box mt={8}>
      <Text fontWeight="bold" color={popmint} mb={3}>
        💬 Discussion
      </Text>
      <Stack spacing={3} mb={4}>
        {comments.data?.map((comment) => (
          <Box key={comment.id} p={3} bg={brandLightGray} borderRadius="lg">
            <Text fontSize="sm" fontWeight="600">
              {comment.authorEmail}
            </Text>
            <Text>{comment.body}</Text>
            <Text fontSize="xs" color="gray.500">
              {new Date(comment.createdAt).toLocaleString()}
            </Text>
          </Box>
        ))}
        {comments.data?.length === 0 && (
          <Text color="gray.400" fontSize="sm">
            No questions or comments yet.
          </Text>
        )}
      </Stack>
      {canPost ? (
        <Stack spacing={2}>
          <Textarea
            placeholder="Ask a question or leave a comment…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button alignSelf="flex-start" isLoading={createComment.isPending} onClick={handlePost}>
            Post
          </Button>
        </Stack>
      ) : (
        <Text color="gray.400" fontSize="sm">
          Purchase this course to join the discussion.
        </Text>
      )}
    </Box>
  );
}

/** FR-002/FR-003/FR-005: lesson titles are public, but video + completion require a purchase. */
export function LessonPlayer() {
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const { firebaseUser } = useAuth();
  const curriculum = useCurriculum(curriculumId ?? "");
  const progress = useCurriculumProgress(curriculumId, { enabled: !!firebaseUser });
  const setComplete = useSetLessonComplete();
  const [selectedLessonId, setSelectedLessonId] = useState<string>();

  const lessons = [...(curriculum.data?.lessons ?? [])].sort((a, b) => a.order - b.order);
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];
  const completedLessonIds = progress.data?.completedLessonIds ?? [];
  const isNotPurchased = progress.error instanceof ApiError && progress.error.status === 403;

  return (
    <Container minW="container.xl" pb={16}>
      <Skeleton isLoaded={!curriculum.isLoading}>
        <Text fontSize="4xl" fontWeight="bold" color={popmag} mb={2}>
          {curriculum.data?.title}
        </Text>

        {progress.data && (
          <Box mb={6}>
            <ProgressBar value={progress.data.percent} colorScheme="teal" borderRadius="full" mb={2} />
            <Flex justify="space-between" align="center">
              <Text color="gray.500" fontSize="sm">
                {progress.data.completedLessonIds.length}/{progress.data.totalLessons} lessons completed ({progress.data.percent}%)
              </Text>
              {progress.data.percent === 100 && curriculumId && (
                <ChakraLink as={RouterLink} to={`/curriculum/${curriculumId}/certificate`} color={popmag} fontWeight="bold">
                  🎓 View certificate
                </ChakraLink>
              )}
            </Flex>
          </Box>
        )}

        {isNotPurchased && (
          <Box p={4} bg="orange.50" borderRadius="lg" mb={6}>
            <Text color="orange.700">
              You haven&apos;t purchased this course yet — lesson videos are locked.{" "}
              <Text as={RouterLink} to={`/curriculum/${curriculumId}`} color={popmint} fontWeight="bold" display="inline">
                Go buy it
              </Text>
              .
            </Text>
          </Box>
        )}

        <Flex gap={8} align="flex-start" direction={{ base: "column", md: "row" }}>
          <Stack minW="260px" spacing={1}>
            {lessons.map((lesson) => (
              <Button
                key={lesson.id}
                justifyContent="flex-start"
                variant="ghost"
                fontWeight={selectedLesson?.id === lesson.id ? "700" : "400"}
                color={selectedLesson?.id === lesson.id ? popmag : "black"}
                bg={selectedLesson?.id === lesson.id ? brandLightGray : "transparent"}
                onClick={() => setSelectedLessonId(lesson.id)}
              >
                {lesson.order}. {lesson.title} {lesson.quiz?.length ? "📝" : ""} {completedLessonIds.includes(lesson.id) && "✓"}
              </Button>
            ))}
            {lessons.length === 0 && <Text color="gray.400">No lessons yet.</Text>}
          </Stack>

          <Box flex="1" minH="360px">
            {!selectedLesson ? (
              <Text color="gray.400">Select a lesson to begin.</Text>
            ) : (
              <>
                {isNotPurchased ? (
                  <Box bg="gray.900" color="white" borderRadius="lg" p={8} textAlign="center" minH="300px">
                    <Text fontSize="2xl">🔒</Text>
                    <Text mt={2}>Purchase this course to watch &ldquo;{selectedLesson.title}&rdquo;.</Text>
                  </Box>
                ) : (
                  <Stack spacing={4}>
                    <Heading size="md">{selectedLesson.title}</Heading>
                    <video
                      key={selectedLesson.id}
                      src={selectedLesson.videoUrl}
                      controls
                      style={{ width: "100%", borderRadius: "12px", background: "black" }}
                    />
                    {selectedLesson.quiz?.length ? (
                      <LessonQuiz key={selectedLesson.id} curriculumId={curriculumId ?? ""} lesson={selectedLesson} />
                    ) : (
                      <Checkbox
                        isChecked={completedLessonIds.includes(selectedLesson.id)}
                        onChange={(event) =>
                          curriculumId &&
                          setComplete.mutate({
                            curriculumId,
                            lessonId: selectedLesson.id,
                            completed: event.target.checked,
                          })
                        }
                      >
                        Mark as complete
                      </Checkbox>
                    )}
                  </Stack>
                )}
                {curriculumId && firebaseUser && (
                  <LessonDiscussion curriculumId={curriculumId} lessonId={selectedLesson.id} canPost={!isNotPurchased} />
                )}
              </>
            )}
          </Box>
        </Flex>
      </Skeleton>
    </Container>
  );
}
