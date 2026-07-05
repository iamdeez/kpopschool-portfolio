import { useState } from "react";
import { Box, Button, HStack, Input, Stack, Text, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTeachers } from "../../api/hooks";
import { api } from "../../api/client";
import { popmint } from "../../theme";

export function AdminTeachers() {
  const teachers = useTeachers();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", category: "", career: "", profile: "" });

  const createTeacher = useMutation({
    mutationFn: () => api.post("/teachers", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setForm({ name: "", category: "", career: "", profile: "" });
    },
    onError: (error) => toast({ status: "error", title: (error as Error).message }),
  });

  const deleteTeacher = useMutation({
    mutationFn: (id: string) => api.delete(`/teachers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teachers"] }),
  });

  return (
    <Stack spacing={6}>
      <Box>
        <Text color={popmint} fontWeight="700" fontSize="lg" mb={3}>Add teacher</Text>
        <HStack>
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input placeholder="Career" value={form.career} onChange={(e) => setForm({ ...form, career: e.target.value })} />
          <Input placeholder="Profile image URL" value={form.profile} onChange={(e) => setForm({ ...form, profile: e.target.value })} />
          <Button isLoading={createTeacher.isPending} onClick={() => createTeacher.mutate()}>Add</Button>
        </HStack>
      </Box>

      <Stack spacing={2}>
        {teachers.data?.map((teacher) => (
          <HStack key={teacher.id} justify="space-between" p={4} bg="white" borderRadius="lg" boxShadow="sm">
            <Text>{teacher.name} — {teacher.category}</Text>
            <Button size="sm" variant="outline" colorScheme="red" onClick={() => deleteTeacher.mutate(teacher.id)}>Delete</Button>
          </HStack>
        ))}
      </Stack>
    </Stack>
  );
}
