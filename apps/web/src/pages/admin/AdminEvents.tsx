import { useState } from "react";
import { Box, Button, HStack, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEvents } from "../../api/hooks";
import { api } from "../../api/client";
import { popmint } from "../../theme";

export function AdminEvents() {
  const events = useEvents();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ title: "", description: "", discountAmount: 0 });

  const createEvent = useMutation({
    mutationFn: () => {
      const now = new Date().toISOString();
      const later = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
      return api.post("/events", {
        ...form,
        index: 0,
        thumbnail: "",
        discountType: "percentage",
        deadlineStart: now,
        deadlineEnd: later,
        useStart: now,
        useEnd: later,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setForm({ title: "", description: "", discountAmount: 0 });
    },
    onError: (error) => toast({ status: "error", title: (error as Error).message }),
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => api.delete(`/events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  return (
    <Stack spacing={6}>
      <Box>
        <Text color={popmint} fontWeight="700" fontSize="lg" mb={3}>Add event</Text>
        <HStack>
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input
            placeholder="Discount %"
            type="number"
            value={form.discountAmount}
            onChange={(e) => setForm({ ...form, discountAmount: Number(e.target.value) })}
          />
          <Button isLoading={createEvent.isPending} onClick={() => createEvent.mutate()}>Add</Button>
        </HStack>
      </Box>

      <Stack spacing={2}>
        {events.data?.map((event) => (
          <HStack key={event.id} justify="space-between" p={4} bg="white" borderRadius="lg" boxShadow="sm">
            <Text>{event.title} — {event.discountAmount}% off</Text>
            <Button size="sm" variant="outline" colorScheme="red" onClick={() => deleteEvent.mutate(event.id)}>Delete</Button>
          </HStack>
        ))}
      </Stack>
    </Stack>
  );
}
