import { Box, Button, Center, Container, Heading, Image, Link as ChakraLink, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useCurriculumProgress, useUserProfile } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { popmag, popmint } from "../theme";
import kpopLogo from "../assets/Logo/KpopLogo.png";

/** FR-006/FR-007: only reachable once progress is 100%; browser print stands in for real PDF generation. */
export function CertificatePage() {
  const { curriculumId } = useParams<{ curriculumId: string }>();
  const { firebaseUser } = useAuth();
  const progress = useCurriculumProgress(curriculumId, { enabled: !!firebaseUser });
  const profile = useUserProfile(firebaseUser?.uid);

  return (
    <Container minW="container.xl" pb={16}>
      <Skeleton isLoaded={!progress.isLoading}>
        {progress.data && progress.data.percent === 100 ? (
          <Center py={12}>
            <Box
              className="certificate"
              w="full"
              maxW="720px"
              p={12}
              border="8px solid"
              borderColor={popmag}
              borderRadius="xl"
              textAlign="center"
              bg="white"
            >
              <Box boxSize="90px" mx="auto" mb={4}>
                <Image src={kpopLogo} alt="K-POP School" />
              </Box>
              <Text fontSize="sm" letterSpacing="widest" color="gray.500" textTransform="uppercase">
                Certificate of Completion
              </Text>
              <Heading size="lg" color={popmint} mt={2}>
                {profile.data?.name ?? "Student"}
              </Heading>
              <Text mt={4} fontSize="lg">
                has successfully completed
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color={popmag} mt={2}>
                {progress.data.curriculumTitle}
              </Text>
              {progress.data.completedAt && (
                <Text mt={4} color="gray.500">
                  Completed on {new Date(progress.data.completedAt).toLocaleDateString()}
                </Text>
              )}
              <Button
                className="no-print"
                mt={8}
                bgColor={popmint}
                color="white"
                _hover={{ opacity: 0.9 }}
                onClick={() => window.print()}
              >
                Print / Save as PDF
              </Button>
            </Box>
          </Center>
        ) : (
          <Box p={8} textAlign="center">
            <Text fontSize="xl" mb={2}>
              🔒 Not yet earned
            </Text>
            <Text color="gray.500" mb={4}>
              {progress.data
                ? `You're at ${progress.data.percent}% — finish every lesson to unlock your certificate.`
                : "Complete this course to unlock your certificate."}
            </Text>
            <Stack direction="row" justify="center">
              {curriculumId && (
                <ChakraLink as={RouterLink} to={`/curriculum/${curriculumId}/lessons`} color={popmint} fontWeight="bold">
                  Back to lessons
                </ChakraLink>
              )}
            </Stack>
          </Box>
        )}
      </Skeleton>
    </Container>
  );
}
