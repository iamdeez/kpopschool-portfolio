import { useState } from "react";
import { Box, Button, ButtonGroup, Container, Flex, HStack, Image, Stack } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { signOut } from "../firebase/auth";
import { popmint } from "../theme";
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
                _hover={{ color: popmint }}
                color={isActive("/teachers") ? popmint : "black"}
              >
                Teachers
              </Button>

              <Stack position="relative" onMouseEnter={() => setHovered("curriculum")} onMouseLeave={() => setHovered(null)}>
                <Button
                  onClick={() => navigate("/curriculum")}
                  w="140px"
                  bgColor="white"
                  borderRadius={0}
                  _hover={{ color: popmint }}
                  color={isActive("/curriculum") ? popmint : "black"}
                >
                  Curriculum
                </Button>
                {hovered === "curriculum" && (
                  <Stack position="absolute" top={12} w="full" bgColor="white" boxShadow="md" zIndex={10}>
                    <Button borderRadius={0} bgColor="white" _hover={{ color: popmint }} onClick={() => navigate("/curriculum")}>
                      Vocal
                    </Button>
                    <Button borderRadius={0} bgColor="white" _hover={{ color: popmint }} onClick={() => navigate("/curriculum")}>
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
                _hover={{ color: popmint }}
                color={isActive("/community") ? popmint : "black"}
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
                    _hover={{ color: popmint }}
                    color={isActive("/mypage") ? popmint : "black"}
                  >
                    My Page
                  </Button>
                  <Button variant="solid" bgColor="#E1E4E4" color="white" onClick={() => signOut()}>
                    LOG OUT
                  </Button>
                </>
              ) : (
                <Button variant="solid" color="white" bgColor={popmint} onClick={() => navigate("/signin")}>
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
