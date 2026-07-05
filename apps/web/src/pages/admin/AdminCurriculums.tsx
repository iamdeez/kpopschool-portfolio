import { useState } from "react";
import { Box, Button, HStack, Input, Radio, RadioGroup, Select, Stack, Text, useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Curriculum, Lesson, QuizQuestion } from "@kpopschool/shared-types";
import { useCurriculums, useTeachers, useUpdateCurriculum } from "../../api/hooks";
import { api } from "../../api/client";
import { popmint, popmag, brandLightGray } from "../../theme";

// crypto.randomUUID() requires a Secure Context (HTTPS/localhost) — avoided
// here since this admin UI may be viewed over plain HTTP on a deployed demo.
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function QuizManager({
  lessons,
  lesson,
  updateCurriculum,
}: {
  lessons: Lesson[];
  lesson: Lesson;
  updateCurriculum: ReturnType<typeof useUpdateCurriculum>;
}) {
  const quiz = lesson.quiz ?? [];
  const [form, setForm] = useState({ question: "", options: ["", "", "", ""], correctOptionIndex: 0 });

  function saveLessonQuiz(nextQuiz: QuizQuestion[]) {
    const nextLessons = lessons.map((candidate) => (candidate.id === lesson.id ? { ...candidate, quiz: nextQuiz } : candidate));
    updateCurriculum.mutate({ lessons: nextLessons });
  }

  function addQuestion() {
    if (!form.question || form.options.some((option) => !option)) {
      return;
    }
    const newQuestion: QuizQuestion = {
      id: generateId("quiz"),
      question: form.question,
      options: form.options,
      correctOptionIndex: form.correctOptionIndex,
    };
    saveLessonQuiz([...quiz, newQuestion]);
    setForm({ question: "", options: ["", "", "", ""], correctOptionIndex: 0 });
  }

  function removeQuestion(questionId: string) {
    saveLessonQuiz(quiz.filter((question) => question.id !== questionId));
  }

  return (
    <Box mt={2} pl={4} borderLeft="2px solid" borderColor={brandLightGray}>
      <Text fontSize="xs" fontWeight="600" color={popmag} mb={1}>
        Quiz
      </Text>
      <Stack spacing={1} mb={2}>
        {quiz.map((question) => (
          <HStack key={question.id} justify="space-between" align="start">
            <Text fontSize="xs">
              {question.question} — correct: {question.options[question.correctOptionIndex]}
            </Text>
            <Button size="xs" variant="ghost" colorScheme="red" onClick={() => removeQuestion(question.id)}>
              Remove
            </Button>
          </HStack>
        ))}
        {quiz.length === 0 && (
          <Text fontSize="xs" color="gray.400">
            No quiz questions yet.
          </Text>
        )}
      </Stack>
      <Stack spacing={1}>
        <Input
          size="xs"
          placeholder="Question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
        />
        <RadioGroup
          value={String(form.correctOptionIndex)}
          onChange={(value) => setForm({ ...form, correctOptionIndex: Number(value) })}
        >
          <Stack spacing={1}>
            {form.options.map((option, index) => (
              <HStack key={index}>
                <Radio size="sm" value={String(index)} />
                <Input
                  size="xs"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const nextOptions = [...form.options];
                    nextOptions[index] = e.target.value;
                    setForm({ ...form, options: nextOptions });
                  }}
                />
              </HStack>
            ))}
          </Stack>
        </RadioGroup>
        <Button size="xs" alignSelf="flex-start" isLoading={updateCurriculum.isPending} onClick={addQuestion}>
          Add question (select the radio for the correct option)
        </Button>
      </Stack>
    </Box>
  );
}

function LessonManager({ curriculum }: { curriculum: Curriculum }) {
  const updateCurriculum = useUpdateCurriculum(curriculum.id);
  const [form, setForm] = useState({ title: "", videoUrl: "", durationMinutes: 15 });
  const lessons = [...(curriculum.lessons ?? [])].sort((a, b) => a.order - b.order);

  function addLesson() {
    if (!form.title || !form.videoUrl) {
      return;
    }
    const newLesson: Lesson = {
      id: generateId("lesson"),
      title: form.title,
      order: lessons.length + 1,
      videoUrl: form.videoUrl,
      durationMinutes: form.durationMinutes,
    };
    updateCurriculum.mutate({ lessons: [...lessons, newLesson] });
    setForm({ title: "", videoUrl: "", durationMinutes: 15 });
  }

  function removeLesson(lessonId: string) {
    updateCurriculum.mutate({ lessons: lessons.filter((lesson) => lesson.id !== lessonId) });
  }

  return (
    <Box mt={3} pl={4} borderLeft="2px solid" borderColor={brandLightGray}>
      <Text fontSize="sm" fontWeight="600" color={popmint} mb={2}>
        Lessons
      </Text>
      <Stack spacing={2} mb={2}>
        {lessons.map((lesson) => (
          <Box key={lesson.id}>
            <HStack justify="space-between">
              <Text fontSize="sm">
                {lesson.order}. {lesson.title} ({lesson.durationMinutes}m)
              </Text>
              <Button size="xs" variant="ghost" colorScheme="red" onClick={() => removeLesson(lesson.id)}>
                Remove
              </Button>
            </HStack>
            <QuizManager lessons={lessons} lesson={lesson} updateCurriculum={updateCurriculum} />
          </Box>
        ))}
        {lessons.length === 0 && (
          <Text fontSize="sm" color="gray.400">
            No lessons yet.
          </Text>
        )}
      </Stack>
      <HStack>
        <Input size="sm" placeholder="Lesson title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input size="sm" placeholder="Video URL" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
        <Input
          size="sm"
          type="number"
          placeholder="Minutes"
          w="90px"
          value={form.durationMinutes}
          onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
        />
        <Button size="sm" isLoading={updateCurriculum.isPending} onClick={addLesson}>
          Add lesson
        </Button>
      </HStack>
    </Box>
  );
}

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
        lessons: [],
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
        <Text color={popmint} fontWeight="700" fontSize="lg" mb={3}>Add curriculum</Text>
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
          <Box key={curriculum.id} p={4} bg="white" borderRadius="lg" boxShadow="sm">
            <HStack justify="space-between">
              <Text>{curriculum.title} — ${(curriculum.price / 100).toFixed(2)}</Text>
              <Button size="sm" variant="outline" colorScheme="red" onClick={() => deleteCurriculum.mutate(curriculum.id)}>Delete</Button>
            </HStack>
            <LessonManager curriculum={curriculum} />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
