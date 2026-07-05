import { Box, Container, Image, Skeleton, Text, SimpleGrid, Button, Stack, HStack } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useTeacher, useCurriculums } from "../api/hooks";
import { popmint, popyellow } from "../theme";

export function TeacherDetail() {
  const { id } = useParams<{ id: string }>();
  const teacher = useTeacher(id ?? "");
  const curriculums = useCurriculums();
  const teacherCurriculums = curriculums.data?.filter((c) => c.teacherId === id) ?? [];

  return (
    <Container minW="container.xl" pb={16}>
      <Skeleton isLoaded={!teacher.isLoading}>
        {teacher.data && (
          <HStack align="start" spacing={8}>
            <Box boxSize="250px" borderRadius="2xl" overflow="hidden" flexShrink={0} bgColor="gray.100">
              <Image src={teacher.data.profile} alt="" w="full" h="full" objectFit="cover" />
            </Box>
            <Stack spacing={2}>
              <Text fontSize="4xl" fontWeight="bold">
                {teacher.data.name}
              </Text>
              <Text color={popmint} fontSize="lg" fontWeight="600">
                {teacher.data.category} Trainer
              </Text>
              <Text fontSize="lg">{teacher.data.career}</Text>
              <Text fontSize="lg" color={popyellow} fontWeight="600">
                ★ {teacher.data.rating.toFixed(1)} ({teacher.data.review} reviews, {teacher.data.student} students)
              </Text>
            </Stack>
          </HStack>
        )}
      </Skeleton>

      <Text fontSize="3xl" fontWeight="bold" mt={12} mb={4}>
        Curriculums by this teacher
      </Text>
      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {teacherCurriculums.map((curriculum) => (
          <Box key={curriculum.id} p={4} borderWidth={1} borderRadius="xl">
            <Text fontWeight="bold" fontSize="lg">
              {curriculum.title}
            </Text>
            <Button
              as={RouterLink}
              to={`/curriculum/${curriculum.id}`}
              size="sm"
              mt={2}
              variant="outline"
              color={popmint}
              borderColor={popmint}
            >
              View curriculum
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
}
