import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Heading,
  Progress as ProgressBar,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useCurriculum, useCurriculumProgress, useSetLessonComplete } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";
import { popmag, popmint, brandLightGray } from "../theme";

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
            <Text color="gray.500" fontSize="sm">
              {progress.data.completedLessonIds.length}/{progress.data.totalLessons} lessons completed ({progress.data.percent}%)
            </Text>
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
                {lesson.order}. {lesson.title} {completedLessonIds.includes(lesson.id) && "✓"}
              </Button>
            ))}
            {lessons.length === 0 && <Text color="gray.400">No lessons yet.</Text>}
          </Stack>

          <Box flex="1" minH="360px">
            {!selectedLesson ? (
              <Text color="gray.400">Select a lesson to begin.</Text>
            ) : isNotPurchased ? (
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
              </Stack>
            )}
          </Box>
        </Flex>
      </Skeleton>
    </Container>
  );
}
