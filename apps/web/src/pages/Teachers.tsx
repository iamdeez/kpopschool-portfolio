import { Box, Container, Image, Link as ChakraLink, SimpleGrid, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import type { Teacher } from "@kpopschool/shared-types";
import { useTeachers } from "../api/hooks";
import { popyellow, popmint, brandGray } from "../theme";

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <ChakraLink
      as={RouterLink}
      to={`/teachers/${teacher.id}`}
      aria-label={`View ${teacher.name}'s profile`}
      _hover={{ textDecoration: "none" }}
    >
      <Stack spacing={1}>
        <Box aspectRatio={1} w="250px" borderRadius="2xl" overflow="hidden" bgColor="gray.100">
          <Image
            src={teacher.profile}
            alt=""
            w="full"
            h="full"
            objectFit="cover"
            transition="all 0.2s ease-in-out"
            _hover={{ transform: "scale(1.1)" }}
          />
        </Box>
        <Text fontSize="2xl" fontWeight="600">
          {teacher.name}
        </Text>
        <Text fontSize="lg" color="gray.500">
          {teacher.category} Trainer
        </Text>
      </Stack>
    </ChakraLink>
  );
}

/** Ported from the original kpopschool/src/Page/CS/Teachers/Teachers.js. */
export function Teachers() {
  const teachers = useTeachers();
  const vocal = teachers.data?.filter((t) => t.category === "Vocal") ?? [];
  const dance = teachers.data?.filter((t) => t.category === "Dance") ?? [];

  return (
    <Container minW="container.xl" pb={16}>
      <Box py={6}>
        <Text fontSize="5xl" fontWeight="bold" color={popyellow}>
          Teachers
        </Text>
      </Box>
      <Tabs variant="unstyled" pb={16}>
        <TabList gap={12}>
          <Tab px={0} fontSize="2xl" fontWeight="600" color={brandGray} _selected={{ color: popmint }}>
            All Trainer
          </Tab>
          <Tab px={0} fontSize="2xl" fontWeight="600" color={brandGray} _selected={{ color: popmint }}>
            Vocal Trainer
          </Tab>
          <Tab px={0} fontSize="2xl" fontWeight="600" color={brandGray} _selected={{ color: popmint }}>
            Dance Trainer
          </Tab>
        </TabList>
        <TabPanels pt={8}>
          <TabPanel px={0}>
            <Stack spacing={16}>
              <Stack spacing={4}>
                <Text fontWeight="600" fontSize="2xl">
                  Vocal Trainer
                </Text>
                <SimpleGrid columns={[2, 3, 4]} spacing={8}>
                  {vocal.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </SimpleGrid>
              </Stack>
              <Stack spacing={4}>
                <Text fontWeight="600" fontSize="2xl">
                  Dance Trainer
                </Text>
                <SimpleGrid columns={[2, 3, 4]} spacing={8}>
                  {dance.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} />
                  ))}
                </SimpleGrid>
              </Stack>
            </Stack>
          </TabPanel>
          <TabPanel px={0}>
            <SimpleGrid columns={[2, 3, 4]} spacing={8}>
              {vocal.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </SimpleGrid>
          </TabPanel>
          <TabPanel px={0}>
            <SimpleGrid columns={[2, 3, 4]} spacing={8}>
              {dance.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
