import { useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { signIn } from "../../firebase/auth";
import { popmint } from "../../theme";

export function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await api.public.post("/users/register", { name, email, password });
      await signIn(email, password);
      navigate("/mypage");
    } catch (error) {
      toast({ status: "error", title: "Sign up failed", description: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box maxW="sm" mx="auto" p={8}>
      <Text fontSize="4xl" fontWeight="bold" mb={6}>
        Sign up
      </Text>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button type="submit" bgColor={popmint} color="white" _hover={{ opacity: 0.9 }} isLoading={loading}>
            Create account
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
