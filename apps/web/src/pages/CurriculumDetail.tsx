import { Box, Button, Container, Flex, Image, Skeleton, Text, Stack } from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useCurriculum, useProductByCurriculum, useTeacher } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { popmag, popmint } from "../theme";
import curriculumDance from "../assets/Image/Curriculum_dance.png";
import curriculumVocal from "../assets/Image/Curriculum_vocal.png";

export function CurriculumDetail() {
  const { id } = useParams<{ id: string }>();
  const curriculum = useCurriculum(id ?? "");
  const product = useProductByCurriculum(id);
  const teacher = useTeacher(curriculum.data?.teacherId ?? "");
  const { firebaseUser } = useAuth();

  const heroImage = curriculum.data?.category === "Dance" ? curriculumDance : curriculumVocal;

  return (
    <Container minW="container.xl" pb={16}>
      <Flex fontWeight="300" fontSize="xl" color="#4E4E4E" align="center" justify="flex-end" pb={4}>
        <Text as={RouterLink} to="/curriculum">
          Curriculum
        </Text>
        <FiChevronRight />
        <Text color={popmint}>{curriculum.data?.title ?? "Detail"}</Text>
      </Flex>

      <Skeleton isLoaded={!curriculum.isLoading}>
        {curriculum.data && (
          <Stack spacing={6}>
            <Box borderRadius="xl" overflow="hidden" maxH="320px">
              <Image src={heroImage} alt="" w="full" h="320px" objectFit="cover" />
            </Box>

            <Text fontSize="5xl" fontWeight="bold" color={popmag}>
              {curriculum.data.title}
            </Text>
            <Text color="gray.500" fontSize="lg">
              {curriculum.data.category} · {curriculum.data.difficulty} · {curriculum.data.totalSessions} sessions
            </Text>
            {teacher.data && (
              <Text fontSize="lg">
                Taught by{" "}
                <Text as={RouterLink} to={`/teachers/${teacher.data.id}`} fontWeight="bold" color={popmint} display="inline">
                  {teacher.data.name}
                </Text>
              </Text>
            )}
            <Text fontSize="lg">{curriculum.data.description}</Text>
            <Text fontWeight="bold" fontSize="3xl">
              ${(curriculum.data.price / 100).toFixed(2)}
            </Text>

            <Stack direction="row" spacing={4}>
              {product.data ? (
                <Button
                  as={RouterLink}
                  to={firebaseUser ? `/payment/${product.data.id}` : "/signin"}
                  bgColor={popmag}
                  color="white"
                  size="lg"
                  _hover={{ opacity: 0.9 }}
                >
                  Buy this course
                </Button>
              ) : (
                <Text color="gray.400" fontSize="sm">
                  Not yet on sale (no product configured)
                </Text>
              )}
              <Button
                as={RouterLink}
                to={firebaseUser ? `/classroom/${curriculum.data.id}` : "/signin"}
                variant="outline"
                color={popmint}
                borderColor={popmint}
                size="lg"
              >
                Join a live class
              </Button>
              <Button
                as={RouterLink}
                to={firebaseUser ? `/curriculum/${curriculum.data.id}/lessons` : "/signin"}
                variant="outline"
                color={popmag}
                borderColor={popmag}
                size="lg"
              >
                Watch lessons
              </Button>
            </Stack>
          </Stack>
        )}
      </Skeleton>
    </Container>
  );
}
