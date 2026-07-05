import { Box, Container, Skeleton, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useAuth } from "../auth/AuthContext";
import { useMyInquiries, useMyPayments, useUserProfile } from "../api/hooks";
import { popmint, brandGray } from "../theme";

export function MyPage() {
  const { firebaseUser } = useAuth();
  const profile = useUserProfile(firebaseUser?.uid);
  const payments = useMyPayments();
  const inquiries = useMyInquiries();

  return (
    <Container minW="container.xl" pb={16}>
      <Skeleton isLoaded={!profile.isLoading}>
        <Text fontSize="5xl" fontWeight="bold" color={popmint}>
          {profile.data?.name ?? "My Page"}
        </Text>
        <Text color="gray.500" fontSize="lg">
          {profile.data?.email}
        </Text>
      </Skeleton>

      <Tabs mt={8} variant="unstyled">
        <TabList gap={8}>
          <Tab px={0} fontSize="xl" fontWeight="600" color={brandGray} _selected={{ color: popmint }}>
            My purchases
          </Tab>
          <Tab px={0} fontSize="xl" fontWeight="600" color={brandGray} _selected={{ color: popmint }}>
            My inquiries
          </Tab>
        </TabList>
        <TabPanels pt={6}>
          <TabPanel px={0}>
            <Skeleton isLoaded={!payments.isLoading}>
              <Stack spacing={2}>
                {payments.data?.map((payment) => (
                  <Box key={payment.id} p={3} borderWidth={1} borderRadius="xl">
                    <Text>
                      {payment.productId} — ${(payment.amount / 100).toFixed(2)}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(payment.createdAt).toLocaleString()}
                    </Text>
                  </Box>
                ))}
                {payments.data?.length === 0 && <Text color="gray.500">No purchases yet.</Text>}
              </Stack>
            </Skeleton>
          </TabPanel>
          <TabPanel px={0}>
            <Skeleton isLoaded={!inquiries.isLoading}>
              <Stack spacing={2}>
                {inquiries.data?.map((inquiry) => (
                  <Box key={inquiry.id} p={3} borderWidth={1} borderRadius="xl">
                    <Text fontWeight="bold">{inquiry.title}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {inquiry.state}
                    </Text>
                  </Box>
                ))}
                {inquiries.data?.length === 0 && <Text color="gray.500">No inquiries yet.</Text>}
              </Stack>
            </Skeleton>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
