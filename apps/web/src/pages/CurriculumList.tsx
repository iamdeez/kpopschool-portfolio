import { useState } from "react";
import { Box, Container, Flex, Image, Link as ChakraLink, SimpleGrid, Skeleton, Stack, Text, Button } from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import { useCurriculums } from "../api/hooks";
import { popmag, popmint } from "../theme";
import curriculumDance from "../assets/Image/Curriculum_dance.png";
import curriculumVocal from "../assets/Image/Curriculum_vocal.png";

/** Ported from the original kpopschool/src/Page/CS/Curriculum/Curriculum.js (hero cards)
 * combined with the curriculum grid, since this demo doesn't split into a
 * separate category-hub + filtered-results flow. */
export function CurriculumList() {
  const curriculums = useCurriculums();
  const [hovered, setHovered] = useState<"dance" | "vocal" | null>(null);

  return (
    <Container minW="container.xl" pb={16}>
      <Flex fontWeight="300" fontSize="xl" color="#4E4E4E" align="center" justify="flex-end">
        <Text>Curriculum</Text>
        <FiChevronRight />
        <Text color={popmint}>Intro</Text>
      </Flex>

      <Box py={6}>
        <Text fontSize="5xl" fontWeight="bold" color={popmag}>
          Curriculum
        </Text>
      </Box>
      <Text fontSize="2xl" fontWeight="600">
        Try different curriculums at K-pop schools
        <br />
        It supports 1:1 and 1:6, VOD
      </Text>

      <SimpleGrid columns={[1, 2]} gap={16} py={16}>
        {[
          { key: "dance" as const, label: "Dance\nCurriculum", image: curriculumDance },
          { key: "vocal" as const, label: "Vocal\nCurriculum", image: curriculumVocal },
        ].map((hero) => (
          <ChakraLink
            as={RouterLink}
            key={hero.key}
            to="/curriculum"
            aria-label={`Browse ${hero.key} curriculum`}
            _hover={{ textDecoration: "none" }}
            borderRadius="xl"
            pt={48}
            px={8}
            pb={8}
            position="relative"
            display="block"
            overflow="hidden"
            onMouseEnter={() => setHovered(hero.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <Text fontSize="4xl" color="white" fontWeight="bold" zIndex={2} position="relative" whiteSpace="pre-line">
              {hero.label}
            </Text>
            <Box position="absolute" top={0} left={0} boxSize="full" borderRadius="xl" overflow="hidden">
              <Image
                transition="all 0.3s ease-in-out"
                transform={hovered === hero.key ? "scale(1.1)" : "scale(1)"}
                src={hero.image}
                alt=""
                w="full"
                h="full"
                objectFit="cover"
              />
            </Box>
            <Box position="absolute" top={0} left={0} boxSize="full" bgColor="rgba(0, 0, 0, 0.2)" zIndex={1} />
          </ChakraLink>
        ))}
      </SimpleGrid>

      <Stack spacing={4}>
        <Text fontSize="2xl" fontWeight="600">
          All Curriculums
        </Text>
        <Skeleton isLoaded={!curriculums.isLoading}>
          <SimpleGrid columns={[1, 2, 3]} spacing={8}>
            {curriculums.data?.map((curriculum) => (
              <Box key={curriculum.id} p={4} borderWidth={1} borderRadius="xl" overflow="hidden">
                <Text fontWeight="bold" fontSize="xl">
                  {curriculum.title}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {curriculum.category} · {curriculum.difficulty} · {curriculum.totalSessions} sessions
                </Text>
                <Text fontWeight="semibold" mt={1} color={popmag}>
                  ${(curriculum.price / 100).toFixed(2)}
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
                  View details
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Skeleton>
      </Stack>
    </Container>
  );
}
