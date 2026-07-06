import { Box, Button, Center, Container, Heading, HStack, Image, Link as ChakraLink, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTeachers, useCurriculums, useFaqs, useDemoLogin } from "../api/hooks";
import { signInWithDemoToken } from "../firebase/auth";
import { popmag, popyellowText, popblueText, popmintText, popmagText, brandGray, brandLightGray, cardElevation } from "../theme";
import { BannerSlider } from "../components/BannerSlider";
import { ImageCarousel } from "../components/ImageCarousel";
import kpopBanner from "../assets/Image/K-popBanner.png";
import banner1 from "../assets/Image/banner1.webp";
import vocalImage from "../assets/Image/vocal.webp";
import danceImage from "../assets/Image/dance.webp";
import curriculumVocal from "../assets/Image/Curriculum_vocal.webp";
import curriculumDance from "../assets/Image/Curriculum_dance.webp";

/**
 * Layout ported from the original kpopschool/src/Page/CS/Home.js — same
 * section structure, colors, and real brand assets. Copy/content is
 * generic (the original pulled hand-authored business copy from a bespoke
 * HOME CMS document this demo doesn't replicate) but driven by our real
 * seeded Teacher/Curriculum data rather than placeholder text.
 */
export function Home() {
  const teachers = useTeachers();
  const curriculums = useCurriculums();
  const faqs = useFaqs();
  const demoLogin = useDemoLogin();
  const navigate = useNavigate();

  async function handleDemoLogin() {
    const { token } = await demoLogin.mutateAsync();
    await signInWithDemoToken(token);
    navigate("/mypage");
  }

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      const y = section.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Lighthouse-confirmed: the raw brand colors fail contrast both as text on
  // white and as a button background under white text (e.g. popyellow at
  // 1.51:1, needs 4.5:1) — use the accessible dark variants here instead.
  const tiers = [
    { name: "Beginner", color: popyellowText, image: curriculumVocal, price: 80, description: "Never trained before? Start here — fundamentals only, at your own pace." },
    { name: "Intermediate", color: popmintText, image: curriculumDance, price: 85, description: "You've got the basics down. Now it's about consistency and cleaner technique." },
    { name: "Advanced", color: popblueText, image: curriculumVocal, price: 90, description: "For trainees prepping for evaluations — real critique, no hand-holding." },
    { name: "Professional", color: popmagText, image: curriculumDance, price: 99, description: "1:1 with a working idol trainer, built around your debut or showcase timeline." },
  ];

  return (
    <Stack spacing={0}>
      <Stack spacing="190px">
        <Container minW="container.xl">
          <Stack spacing={16}>
            <BannerSlider images={[kpopBanner, banner1]} />
            <Stack spacing={12}>
              <Heading as="h1" fontSize="3xl">
                Learn K-Pop Dance &amp; Vocal Online
              </Heading>
              <Text fontSize="xl" whiteSpace="pre-line">
                Direct from working idol trainers.{"\n"}
                Book a class, meet your teacher live, and grow as an idol-in-training.
              </Text>
              <Box>
                <Button
                  fontSize="2xl"
                  px={24}
                  py={8}
                  variant="outline"
                  borderColor={popmag}
                  color={popmag}
                  onClick={() => scrollToSection("Teachers")}
                >
                  VIEW MORE
                </Button>
              </Box>
            </Stack>
          </Stack>
        </Container>

        <Box bgColor={brandGray}>
          <Container minW="container.xl" py={16}>
            <ImageCarousel />
          </Container>
        </Box>

        <Container minW="container.xl" pb={24}>
          <Stack spacing={16}>
            <Stack id="Teachers">
              <Heading as="h2" fontSize="6xl" color={popyellowText}>
                Teachers
              </Heading>
              <SimpleGrid columns={[1, 2, 4]} spacing={8} pt={4}>
                {teachers.data?.map((teacher) => (
                  <ChakraLink
                    as={RouterLink}
                    key={teacher.id}
                    to={`/teachers/${teacher.id}`}
                    // WCAG 2.5.3 (Label in Name): no aria-label override —
                    // see Teachers.tsx TeacherCard for why (axe's rule kept
                    // failing against a reordered/appended label; the link's
                    // own visible content is already a sufficient name).
                    _hover={{ textDecoration: "none" }}
                  >
                    <Stack spacing={3} bgColor="white" p={4} {...cardElevation}>
                      <Box aspectRatio={1} borderRadius="lg" overflow="hidden" bgColor="gray.100">
                        <Image src={teacher.profile} alt="" w="full" h="full" objectFit="cover" />
                      </Box>
                      <Text fontSize="2xl" fontWeight="600">
                        {teacher.name}
                      </Text>
                      <Text fontSize="lg" color="gray.600">
                        {teacher.category} Trainer
                      </Text>
                    </Stack>
                  </ChakraLink>
                ))}
              </SimpleGrid>
            </Stack>

            <Stack id="Lessons">
              <Heading as="h2" fontSize="6xl" color={popmag}>
                Lessons
              </Heading>
              <Stack spacing={16} pt={4}>
                <HStack align="start" spacing={12}>
                  <Box w="full" borderRadius="lg" overflow="hidden">
                    <Image w="full" src={vocalImage} alt="" />
                  </Box>
                  <Stack w="full" justify="space-between" fontSize="2xl" h="full">
                    <Text>Solo vocal coaching for K-pop idol vocal lines — pitch, tone, and stage presence.</Text>
                    <Box>
                      <Button color="white" bgColor={popmintText} size="lg" px={16} py={4} onClick={() => navigate("/curriculum")}>
                        Go CURRICULUM
                      </Button>
                    </Box>
                  </Stack>
                </HStack>
                <HStack align="start" spacing={12}>
                  <Stack w="full" justify="space-between" fontSize="2xl" h="full">
                    <Text>Choreography training for K-pop dance breaks, formation, and camera work.</Text>
                    <Box display="flex" justifyContent="flex-end">
                      <Button color="white" bgColor={popmintText} size="lg" px={16} py={4} onClick={() => navigate("/curriculum")}>
                        Go CURRICULUM
                      </Button>
                    </Box>
                  </Stack>
                  <Box w="full" borderRadius="lg" overflow="hidden">
                    <Image w="full" src={danceImage} alt="" />
                  </Box>
                </HStack>
              </Stack>
            </Stack>

            <Stack id="Our Courses">
              <Heading as="h2" fontSize="6xl" color={popblueText}>
                Our Courses
              </Heading>
              <HStack justify="space-between" spacing={8} align="stretch" pt={4} flexWrap="wrap">
                {tiers.map((tier) => (
                  <Stack key={tier.name} w="full" justify="space-between" spacing={4} bgColor="white" p={4} {...cardElevation}>
                    <Stack>
                      <Image src={tier.image} alt="" borderRadius="lg" />
                      <Text color={tier.color} fontSize="3xl" fontWeight="bold">
                        {tier.name}
                      </Text>
                      <Text fontSize="lg">{tier.description}</Text>
                    </Stack>
                    <Button
                      bgColor={tier.color}
                      color="white"
                      fontSize="xl"
                      whiteSpace="pre-line"
                      height="90px"
                      borderRadius="lg"
                      onClick={() => navigate("/curriculum")}
                    >
                      {`$${tier.price} per session\nBOOK NOW`}
                    </Button>
                  </Stack>
                ))}
              </HStack>
            </Stack>

            <Stack>
              <Heading as="h2" fontSize="6xl" color={popmag}>
                Lesson Type
              </Heading>
              <HStack justify="space-between" align="flex-start" spacing={8} pt={4} flexWrap="wrap">
                {[
                  { key: "1-1", label: "1:1 Personal", color: popyellowText, image: vocalImage, description: "One-on-one live sessions matched to your goals." },
                  { key: "1-6", label: "1:6 Group", color: popmintText, image: danceImage, description: "Small-group classes to train and perform together." },
                  { key: "vod", label: "VOD", color: popblueText, image: null, description: "Self-paced recorded lessons, watch anytime." },
                ].map((type) => (
                  <ChakraLink
                    key={type.key}
                    as={RouterLink}
                    to="/curriculum"
                    // WCAG 2.5.3 (Label in Name): no aria-label override —
                    // see Teachers.tsx TeacherCard for why.
                    _hover={{ textDecoration: "none" }}
                    w="full"
                  >
                    <Stack bgColor="white" p={4} {...cardElevation}>
                      {type.image ? (
                        <Box aspectRatio={4 / 3} borderRadius="lg" overflow="hidden">
                          <Image src={type.image} alt="" w="full" h="full" objectFit="cover" />
                        </Box>
                      ) : (
                        // No source photo fits "watch a recorded lesson" — a flat play-icon
                        // tile reads more intentional than stretching the old 187x115 icon
                        // raster to fill this box (it went soft/blurry at that size).
                        <Center aspectRatio={4 / 3} borderRadius="lg" bgGradient="linear(to-br, popblue.500, popmint.500)">
                          <Center boxSize="64px" borderRadius="full" bgColor="whiteAlpha.900">
                            <Box
                              w={0}
                              h={0}
                              ml={1}
                              borderTop="12px solid transparent"
                              borderBottom="12px solid transparent"
                              borderLeft={`20px solid ${popblueText}`}
                            />
                          </Center>
                        </Center>
                      )}
                      <Text color={type.color} fontSize="3xl" fontWeight="bold">
                        {type.label}
                      </Text>
                      <Text fontSize="lg">{type.description}</Text>
                    </Stack>
                  </ChakraLink>
                ))}
              </HStack>
            </Stack>

            {curriculums.data && curriculums.data.length > 0 && (
              <Stack>
                <Heading as="h2" fontSize="6xl" color={popyellowText}>
                  Popular Curriculums
                </Heading>
                <SimpleGrid columns={[1, 2, 3]} spacing={8} pt={4}>
                  {curriculums.data.slice(0, 3).map((curriculum) => (
                    <Box key={curriculum.id} bgColor="white" p={4} {...cardElevation}>
                      <Text fontWeight="bold" fontSize="xl">
                        {curriculum.title}
                      </Text>
                      <Text color="gray.600">${(curriculum.price / 100).toFixed(2)}</Text>
                      <Button as={RouterLink} to={`/curriculum/${curriculum.id}`} size="sm" mt={2} bgColor={popmintText} color="white">
                        View curriculum
                      </Button>
                    </Box>
                  ))}
                </SimpleGrid>
              </Stack>
            )}

            {faqs.data && faqs.data.length > 0 && (
              <Stack>
                <Heading as="h2" fontSize="6xl" color={popmag}>
                  FAQ
                </Heading>
                <Stack spacing={2} pt={4}>
                  {faqs.data.map((faq) => (
                    <Box key={faq.id}>
                      <Text fontWeight="semibold">Q. {faq.question}</Text>
                      <Text color="gray.600">A. {faq.answer}</Text>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Container>

        <Center bgColor={brandLightGray} py={24}>
          <Stack align="center" spacing={8}>
            <HStack fontSize={["48px", "80px", "140px"]} spacing={8} fontWeight="bold" whiteSpace="nowrap">
              <Text color={popmintText}>Be a</Text>
              <Text color={popyellowText}>STAR</Text>
              <Text color={popmintText}>with us!</Text>
            </HStack>
            <Button
              size="lg"
              colorScheme="purple"
              bgColor={popmagText}
              color="white"
              isLoading={demoLogin.isPending}
              onClick={handleDemoLogin}
            >
              Try the demo — no signup required
            </Button>
          </Stack>
        </Center>
      </Stack>
    </Stack>
  );
}
