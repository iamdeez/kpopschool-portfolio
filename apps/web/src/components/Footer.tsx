import { Box, Container, Flex, HStack, Image, Stack, Text } from "@chakra-ui/react";
import { brandDarkTeal, brandFadedTealText, brandMintText } from "../theme";
import kpopLogo from "../assets/Logo/KpopLogo.png";

/** Ported from the original kpopschool/src/Component/Footer.js. */
export function Footer() {
  return (
    <Flex bgColor={brandDarkTeal} pt={12} pb={16} w="full">
      <Container maxW="container.xl">
        <Stack spacing={24}>
          <HStack justify="space-between" align="flex-start">
            <Box boxSize="120px">
              <Image src={kpopLogo} alt="kpopschool" />
            </Box>
            <Stack spacing={3} color={brandMintText} fontSize="lg" fontWeight="600">
              <Text>Contact Us</Text>
              <Text>Email: hello@kpopschool.portfolio</Text>
              <Text whiteSpace="pre-line">Portfolio demo — original layout ported from kpopschool</Text>
            </Stack>
          </HStack>
          <Box display="flex" justifyContent="center">
            {/* Lighthouse-confirmed: brandFadedTeal on brandDarkTeal is 3.94:1, needs 4.5:1. */}
            <Text color={brandFadedTealText} fontSize="lg">
              @copyright. kpopschool portfolio demo. All Rights Reserved.
            </Text>
          </Box>
        </Stack>
      </Container>
    </Flex>
  );
}
