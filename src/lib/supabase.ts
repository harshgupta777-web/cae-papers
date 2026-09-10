import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const MATERIAL_TYPES = [
  { value: "paper", label: "Question paper" },
  { value: "answer_pdf", label: "Answer PDF" },
  { value: "important_questions", label: "Important questions" },
  { value: "notes", label: "Notes" },
  { value: "syllabus", label: "Syllabus" },
  { value: "practical", label: "Practical file" },
  { value: "other", label: "Other" },
];

export const EXAM_TYPES = [
  { value: "cae1", label: "CAE 1" },
  { value: "cae2", label: "CAE 2" },
  { value: "mid_sem", label: "Mid semester" },
  { value: "end_sem", label: "End semester" },
  { value: "external", label: "External exam" },
  { value: "internal", label: "Internal" },
  { value: "practical", label: "Practical" },
  { value: "assignment", label: "Assignment" },
];

export function labelOf(
  list: { value: string; label: string }[],
  value: string | null | undefined
) {
  if (!value) return "";
  return list.find((i) => i.value === value)?.label ?? value;
}

export function makeSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
