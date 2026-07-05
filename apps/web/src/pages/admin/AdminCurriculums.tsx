import { useState } from "react";
import { Box, Button, HStack, Input, Select, Stack, Text, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurriculums, useTeachers } from "../../api/hooks";
import { api } from "../../api/client";

export function AdminCurriculums() {
  const curriculums = useCurriculums();
  const teachers = useTeachers();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({
    title: "",
    teacherId: "",
    category: "",
    format: "1:1",
    price: 0,
  });

  const createCurriculum = useMutation({
    mutationFn: () =>
      api.post("/curriculums", {
        ...form,
        image: "",
        month: 1,
        totalSessions: 8,
        sessions: [],
        description: "",
        difficulty: "Beginner",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculums"] });
      setForm({ title: "", teacherId: "", category: "", format: "1:1", price: 0 });
    },
    onError: (error) => toast({ status: "error", title: (error as Error).message }),
  });

  const deleteCurriculum = useMutation({
    mutationFn: (id: string) => api.delete(`/curriculums/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["curriculums"] }),
  });

  return (
    <Stack spacing={6}>
      <Box>
        <Text fontWeight="bold" mb={2}>Add curriculum</Text>
        <HStack>
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select placeholder="Teacher" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
            {teachers.data?.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
            ))}
          </Select>
          <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input
            placeholder="Price (cents)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
          <Button isLoading={createCurriculum.isPending} onClick={() => createCurriculum.mutate()}>Add</Button>
        </HStack>
      </Box>

      <Stack spacing={2}>
        {curriculums.data?.map((curriculum) => (
          <HStack key={curriculum.id} justify="space-between" p={3} borderWidth={1} borderRadius="md">
            <Text>{curriculum.title} — ${(curriculum.price / 100).toFixed(2)}</Text>
            <Button size="sm" colorScheme="red" onClick={() => deleteCurriculum.mutate(curriculum.id)}>Delete</Button>
          </HStack>
        ))}
      </Stack>
    </Stack>
  );
}
