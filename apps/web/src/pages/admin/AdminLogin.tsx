import { useState } from "react";
import { Box, Button, Center, FormControl, FormLabel, Image, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../../firebase/auth";
import { auth } from "../../firebase/config";
import { popmint } from "../../theme";
import kpopLogo from "../../assets/Logo/KpopLogo.png";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await signIn(email, password);
      const tokenResult = await user.getIdTokenResult();
      if (tokenResult.claims.admin !== true) {
        await auth.signOut();
        toast({ status: "error", title: "This account does not have admin access" });
        return;
      }
      navigate("/admin");
    } catch (error) {
      toast({ status: "error", title: "Sign in failed", description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Center minH="100vh" bg="white">
      <Stack align="center" w="full" maxW="420px" px={6}>
        <Box boxSize="180px" mb={2}>
          <Image src={kpopLogo} alt="K-POP School" />
        </Box>
        <Text textAlign="center" color={popmint} fontSize="3xl" fontWeight="800" mb={8}>
          K-POP School admin
        </Text>
        <Box as="form" onSubmit={handleSubmit} w="full">
          <Stack spacing={4} w="full">
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="gray.500">Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="gray.500">Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Button
              type="submit"
              size="lg"
              bgColor={popmint}
              color="white"
              _hover={{ opacity: 0.9 }}
              isLoading={loading}
              mt={4}
            >
              Sign in
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Center>
  );
}
