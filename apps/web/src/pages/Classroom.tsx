import { useEffect } from "react";
import { Box, Button, Heading, Spinner, Text } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useJoinVideoClass } from "../api/hooks";
import { popmint } from "../theme";

/** FR-005/SC-005: reaches a classroom screen without ever touching a real Zoom account in demo mode. */
export function Classroom() {
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const join = useJoinVideoClass();

  useEffect(() => {
    if (curriculumId) {
      join.mutate(curriculumId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculumId]);

  useEffect(() => {
    if (join.data && !join.data.isMock) {
      window.location.href = join.data.joinUrl;
    }
  }, [join.data]);

  if (join.isPending || !curriculumId) {
    return (
      <Box p={8} textAlign="center">
        <Spinner />
        <Text mt={4}>Connecting to your class…</Text>
      </Box>
    );
  }

  if (join.isError) {
    return (
      <Box p={8} textAlign="center">
        <Text color="red.500">Could not join the class.</Text>
      </Box>
    );
  }

  if (join.data?.isMock) {
    return (
      <Box p={8} textAlign="center" bg="gray.900" color="white" minH="60vh" borderRadius="md">
        <Heading size="md">Mock classroom</Heading>
        <Text mt={4}>Meeting number: {join.data.meetingNumber}</Text>
        <Text mt={2} color="gray.400">
          This is a demo — no real Zoom session was created (INTEGRATION_MODE=demo).
        </Text>
        <Button as={RouterLink} to="/mypage" mt={6} bgColor={popmint} color="white" _hover={{ opacity: 0.9 }}>
          Leave class
        </Button>
      </Box>
    );
  }

  return null;
}
