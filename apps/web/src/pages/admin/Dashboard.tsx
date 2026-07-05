import { useState } from "react";
import { Box, Button, Flex, HStack, Heading, Image, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { AdminTeachers } from "./AdminTeachers";
import { AdminCurriculums } from "./AdminCurriculums";
import { AdminEvents } from "./AdminEvents";
import { AdminFaqs } from "./AdminFaqs";
import { AdminReports } from "./AdminReports";
import { signOut } from "../../firebase/auth";
import { popmag, popmint, brandLightGray } from "../../theme";
import kpopLogo from "../../assets/Logo/KpopLogo.png";

// Mirrors the original AD/Dashboard/Sidebar.js (fixed 240px, brandLightGray
// bg, popmag right border + active-tab accent) and DashboardTopbar.js
// (breadcrumb + log out) — ported as local state instead of nested routes
// since the five panels don't need independently linkable URLs.
const SECTIONS = [
  { key: "teachers", label: "Teachers", Panel: AdminTeachers },
  { key: "curriculum", label: "Curriculum", Panel: AdminCurriculums },
  { key: "events", label: "Events", Panel: AdminEvents },
  { key: "faq", label: "FAQ", Panel: AdminFaqs },
  { key: "reports", label: "Reports", Panel: AdminReports },
] as const;

const SIDEBAR_WIDTH = "240px";

export function Dashboard() {
  const [active, setActive] = useState<(typeof SECTIONS)[number]["key"]>("teachers");
  const navigate = useNavigate();
  const section = SECTIONS.find((item) => item.key === active) ?? SECTIONS[0];
  const ActivePanel = section.Panel;

  async function handleLogOut() {
    await signOut();
    navigate("/admin/login");
  }

  return (
    <Flex minH="100vh" bg="white">
      <Stack
        minH="100vh"
        position="fixed"
        left={0}
        top={0}
        w={SIDEBAR_WIDTH}
        zIndex="sticky"
        py={8}
        bgColor={brandLightGray}
        align="center"
        borderRight={`2px solid ${popmag}`}
      >
        <Box boxSize="110px">
          <Image src={kpopLogo} alt="K-POP School" />
        </Box>
        <Stack pt={4} spacing={0} w="full" align="center">
          {SECTIONS.map((item) => (
            <Flex key={item.key} position="relative" w="full" justify="center">
              <Button
                w="full"
                h="50px"
                variant="ghost"
                borderRadius={0}
                fontWeight="700"
                fontSize="md"
                color={active === item.key ? popmag : "black"}
                onClick={() => setActive(item.key)}
                _hover={{ bgColor: "transparent" }}
                _active={{ bgColor: "transparent" }}
              >
                {item.label}
              </Button>
              <Box
                display={active === item.key ? "block" : "none"}
                position="absolute"
                right={0}
                top={0}
                w="4px"
                h="full"
                bgColor={popmag}
              />
            </Flex>
          ))}
        </Stack>
      </Stack>

      <Box flex="1" ml={SIDEBAR_WIDTH}>
        <HStack
          justify="space-between"
          px={10}
          py={5}
          borderBottom="1px solid"
          borderColor={brandLightGray}
          position="sticky"
          top={0}
          bg="white"
          zIndex="sticky"
        >
          <HStack>
            <Text color="gray.500">Dashboard</Text>
            <FiChevronRight color={popmint} />
            <Text fontWeight="600">{section.label}</Text>
          </HStack>
          <Button size="sm" onClick={handleLogOut}>Log out</Button>
        </HStack>
        <Box p={10}>
          <Heading size="lg" mb={6} color={popmint}>{section.label}</Heading>
          <ActivePanel />
        </Box>
      </Box>
    </Flex>
  );
}
