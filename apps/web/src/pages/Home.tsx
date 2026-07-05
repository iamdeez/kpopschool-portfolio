import { Box, Button, Center, Container, Heading, HStack, Image, Link as ChakraLink, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTeachers, useCurriculums, useFaqs, useDemoLogin } from "../api/hooks";
import { signInWithDemoToken } from "../firebase/auth";
import { popyellow, popblue, popmint, popmag, brandGray, brandLightGray } from "../theme";
import { BannerSlider } from "../components/BannerSlider";
import { ImageCarousel } from "../components/ImageCarousel";
import kpopBanner from "../assets/Image/K-popBanner.png";
import banner1 from "../assets/Image/banner1.png";
import vocalImage from "../assets/Image/vocal.png";
import danceImage from "../assets/Image/dance.png";
import curriculumVocal from "../assets/Image/Curriculum_vocal.png";
import curriculumDance from "../assets/Image/Curriculum_dance.png";
import event1 from "../assets/Image/event1.png";
import videoImage from "../assets/Image/video.png";
import checkerImage from "../assets/Image/checker.png";

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

  const tiers = [
    { name: "Beginner", color: popyellow, image: curriculumVocal, price: 80 },
    { name: "Intermediate", color: popmint, image: curriculumDance, price: 85 },
    { name: "Advanced", color: popblue, image: curriculumVocal, price: 90 },
    { name: "Professional", color: popmag, image: curriculumDance, price: 99 },
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
              <Heading as="h2" fontSize="6xl" color={popyellow}>
                Teachers
              </Heading>
              <SimpleGrid columns={[1, 2, 4]} spacing={8} pt={4}>
                {teachers.data?.map((teacher) => (
                  <ChakraLink
                    as={RouterLink}
                    key={teacher.id}
                    to={`/teachers/${teacher.id}`}
                    aria-label={`View ${teacher.name}'s profile`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Stack spacing={1}>
                      <Box aspectRatio={1} borderRadius="2xl" overflow="hidden" bgColor="gray.100">
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
                      <Button color="white" bgColor={popmint} size="lg" px={16} py={4} onClick={() => navigate("/curriculum")}>
                        Go CURRICULUM
                      </Button>
                    </Box>
                  </Stack>
                </HStack>
                <HStack align="start" spacing={12}>
                  <Stack w="full" justify="space-between" fontSize="2xl" h="full">
                    <Text>Choreography training for K-pop dance breaks, formation, and camera work.</Text>
                    <Box display="flex" justifyContent="flex-end">
                      <Button color="white" bgColor={popmint} size="lg" px={16} py={4} onClick={() => navigate("/curriculum")}>
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
              <Heading as="h2" fontSize="6xl" color={popblue}>
                Our Courses
              </Heading>
              <HStack justify="space-between" spacing={8} align="stretch" pt={4} flexWrap="wrap">
                {tiers.map((tier) => (
                  <Stack key={tier.name} w="full" justify="space-between" spacing={4}>
                    <Stack>
                      <Image src={tier.image} alt="" borderRadius="lg" />
                      <Text color={tier.color} fontSize="3xl" fontWeight="bold">
                        {tier.name}
                      </Text>
                      <Text fontSize="lg">1:1 personal sessions with a dedicated idol trainer.</Text>
                    </Stack>
                    <Button
                      bgColor={tier.color}
                      color="white"
                      fontSize="xl"
                      whiteSpace="pre-line"
                      height="90px"
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
                  { key: "1-1", label: "1:1 Personal", color: popyellow, image: event1, description: "One-on-one live sessions matched to your goals." },
                  { key: "1-6", label: "1:6 Group", color: popmint, image: checkerImage, description: "Small-group classes to train and perform together." },
                  { key: "vod", label: "VOD", color: popblue, image: videoImage, description: "Self-paced recorded lessons, watch anytime." },
                ].map((type) => (
                  <ChakraLink
                    key={type.key}
                    as={RouterLink}
                    to="/curriculum"
                    aria-label={`Browse ${type.label} lessons`}
                    _hover={{ textDecoration: "none" }}
                    w="full"
                  >
                    <Stack>
                      <Image src={type.image} alt="" borderRadius="lg" />
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
                <Heading as="h2" fontSize="6xl" color={popyellow}>
                  Popular Curriculums
                </Heading>
                <SimpleGrid columns={[1, 2, 3]} spacing={8} pt={4}>
                  {curriculums.data.slice(0, 3).map((curriculum) => (
                    <Box key={curriculum.id} p={4} borderWidth={1} borderRadius="xl">
                      <Text fontWeight="bold" fontSize="xl">
                        {curriculum.title}
                      </Text>
                      <Text color="gray.500">${(curriculum.price / 100).toFixed(2)}</Text>
                      <Button as={RouterLink} to={`/curriculum/${curriculum.id}`} size="sm" mt={2} colorScheme="teal">
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
              <Text color={popmint}>Be a</Text>
              <Text color={popyellow}>STAR</Text>
              <Text color={popmint}>with us!</Text>
            </HStack>
            <Button
              size="lg"
              colorScheme="purple"
              bgColor={popmag}
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
