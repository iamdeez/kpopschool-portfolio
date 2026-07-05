import { Box, Button, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { popmint } from "../theme";

export function PaymentResult() {
  return (
    <Box p={8} textAlign="center">
      <Text fontSize="4xl" fontWeight="bold" mb={4}>
        Payment complete 🎉
      </Text>
      <Text mb={6} color="gray.500">
        No real charge was made — this demo runs with INTEGRATION_MODE=demo by default.
      </Text>
      <Button as={RouterLink} to="/mypage" bgColor={popmint} color="white" _hover={{ opacity: 0.9 }}>
        View my purchases
      </Button>
    </Box>
  );
}
