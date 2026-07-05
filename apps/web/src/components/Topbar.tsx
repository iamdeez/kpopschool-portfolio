import { useState } from "react";
import { Box, Button, ButtonGroup, Container, Flex, HStack, Image, Stack } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { signOut } from "../firebase/auth";
import { popmintText } from "../theme";
import kpopLogo from "../assets/Logo/KpopLogo.png";
import logoTitle from "../assets/Logo/LogoTitle.png";

/** Ported from the original kpopschool/src/Component/Topbar.js: fixed nav,
 * logo lockup, hover-reveal submenus, mint active-route color. */
export function Topbar() {
  const { firebaseUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Stack spacing={0} mb={32}>
      <Flex py={2} position="fixed" w="100%" bgColor="white" zIndex={100} borderBottomWidth={1}>
        <Container minW="container.xl">
          <HStack justifyContent="space-between">
            <HStack onClick={() => navigate("/")} cursor="pointer">
              <Box boxSize="56px">
                <Image src={kpopLogo} alt="kpopschool" />
              </Box>
              <Box h="24px">
                <Image src={logoTitle} alt="" h="full" />
              </Box>
            </HStack>
            <ButtonGroup size="lg" variant="ghost" borderRadius={0}>
              <Button
                onClick={() => navigate("/teachers")}
                w="140px"
                bgColor="white"
                borderRadius={0}
                _hover={{ color: popmintText }}
                color={isActive("/teachers") ? popmintText : "black"}
              >
                Teachers
              </Button>

              <Stack position="relative" onMouseEnter={() => setHovered("curriculum")} onMouseLeave={() => setHovered(null)}>
                <Button
                  onClick={() => navigate("/curriculum")}
                  w="140px"
                  bgColor="white"
                  borderRadius={0}
                  _hover={{ color: popmintText }}
                  color={isActive("/curriculum") ? popmintText : "black"}
                >
                  Curriculum
                </Button>
                {hovered === "curriculum" && (
                  <Stack position="absolute" top={12} w="full" bgColor="white" boxShadow="md" zIndex={10}>
                    <Button borderRadius={0} bgColor="white" _hover={{ color: popmintText }} onClick={() => navigate("/curriculum")}>
                      Vocal
                    </Button>
                    <Button borderRadius={0} bgColor="white" _hover={{ color: popmintText }} onClick={() => navigate("/curriculum")}>
                      Dance
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Button
                onClick={() => navigate("/community")}
                w="140px"
                bgColor="white"
                borderRadius={0}
                _hover={{ color: popmintText }}
                color={isActive("/community") ? popmintText : "black"}
              >
                Community
              </Button>

              {firebaseUser ? (
                <>
                  <Button
                    onClick={() => navigate("/mypage")}
                    w="140px"
                    bgColor="white"
                    borderRadius={0}
                    _hover={{ color: popmintText }}
                    color={isActive("/mypage") ? popmintText : "black"}
                  >
                    My Page
                  </Button>
                  <Button variant="solid" bgColor="gray.600" color="white" onClick={() => signOut()}>
                    LOG OUT
                  </Button>
                </>
              ) : (
                // Lighthouse-confirmed: popmint under white text is 2.2:1, needs 4.5:1 — popmintText fixes it.
                <Button variant="solid" color="white" bgColor={popmintText} onClick={() => navigate("/signin")}>
                  LOG IN
                </Button>
              )}
            </ButtonGroup>
          </HStack>
        </Container>
      </Flex>
    </Stack>
  );
}
