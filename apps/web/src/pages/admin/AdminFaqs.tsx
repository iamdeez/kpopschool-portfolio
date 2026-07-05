import { useState } from "react";
import { Box, Button, HStack, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFaqs } from "../../api/hooks";
import { api } from "../../api/client";

export function AdminFaqs() {
  const faqs = useFaqs();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ question: "", answer: "" });

  const createFaq = useMutation({
    mutationFn: () => api.post("/faq", { ...form, index: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] });
      setForm({ question: "", answer: "" });
    },
    onError: (error) => toast({ status: "error", title: (error as Error).message }),
  });

  const deleteFaq = useMutation({
    mutationFn: (id: string) => api.delete(`/faq/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faq"] }),
  });

  return (
    <Stack spacing={6}>
      <Box>
        <Text fontWeight="bold" mb={2}>Add FAQ</Text>
        <HStack>
          <Input placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <Input placeholder="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          <Button isLoading={createFaq.isPending} onClick={() => createFaq.mutate()}>Add</Button>
        </HStack>
      </Box>

      <Stack spacing={2}>
        {faqs.data?.map((faq) => (
          <HStack key={faq.id} justify="space-between" p={3} borderWidth={1} borderRadius="md">
            <Text>{faq.question}</Text>
            <Button size="sm" colorScheme="red" onClick={() => deleteFaq.mutate(faq.id)}>Delete</Button>
          </HStack>
        ))}
      </Stack>
    </Stack>
  );
}
