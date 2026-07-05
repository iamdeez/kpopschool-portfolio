import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../../firebase/auth";
import { auth } from "../../firebase/config";
import { popmint } from "../../theme";

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
    <Box maxW="sm" mx="auto" p={8}>
      <Text fontSize="4xl" fontWeight="bold" mb={6}>
        Admin sign in
      </Text>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button type="submit" bgColor={popmint} color="white" _hover={{ opacity: 0.9 }} isLoading={loading}>
            Sign in
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
