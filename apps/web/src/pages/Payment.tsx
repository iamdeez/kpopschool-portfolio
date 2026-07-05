import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useCharge, useProduct } from "../api/hooks";
import { popmag } from "../theme";

/**
 * FR-004/SC-004: card fields are cosmetic — demo mode never sends them to
 * Stripe. paymentMethodId defaults to Stripe's well-known test token so the
 * same form still works unmodified if INTEGRATION_MODE=real is used for a
 * live walkthrough (research.md "기타 고려사항").
 */
export function Payment() {
  const { productId } = useParams<{ productId: string }>();
  const product = useProduct(productId);
  const charge = useCharge();
  const navigate = useNavigate();
  const toast = useToast();
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");

  async function handlePay() {
    if (!productId) return;
    try {
      await charge.mutateAsync({ productId, paymentMethodId: "pm_card_visa" });
      navigate("/payment/result");
    } catch (error) {
      toast({ status: "error", title: "Payment failed", description: (error as Error).message });
    }
  }

  return (
    <Box maxW="sm" mx="auto" p={8}>
      <Text fontSize="4xl" fontWeight="bold" color={popmag} mb={2}>
        Checkout
      </Text>
      {product.data && (
        <Text mb={6} color="gray.600" fontSize="lg">
          {product.data.name} — ${(product.data.price.unitAmount / 100).toFixed(2)}
        </Text>
      )}
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Card number (demo only, never sent anywhere)</FormLabel>
          <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
        </FormControl>
        <Button bgColor={popmag} color="white" _hover={{ opacity: 0.9 }} isLoading={charge.isPending} onClick={handlePay}>
          Pay now
        </Button>
      </Stack>
    </Box>
  );
}
