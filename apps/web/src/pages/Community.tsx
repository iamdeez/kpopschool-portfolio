import { Box, Container, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useReviews } from "../api/hooks";
import { popmag, popyellow } from "../theme";

export function Community() {
  const reviews = useReviews();

  return (
    <Container minW="container.xl" pb={16}>
      <Box py={6}>
        <Text fontSize="5xl" fontWeight="bold" color={popmag}>
          Community
        </Text>
      </Box>
      <Skeleton isLoaded={!reviews.isLoading}>
        <Stack spacing={4}>
          {reviews.data?.map((review) => (
            <Box key={review.id} p={4} borderWidth={1} borderRadius="xl">
              <Text color={popyellow}>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </Text>
              <Text mt={1} fontSize="lg">
                {review.comment}
              </Text>
            </Box>
          ))}
          {reviews.data?.length === 0 && <Text color="gray.500">No reviews yet.</Text>}
        </Stack>
      </Skeleton>
    </Container>
  );
}
