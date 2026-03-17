import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  dueDate: z
    .string()
    .trim()
    .min(1, "Due date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  startTime: z
    .string()
    .trim()
    .min(1, "Start time is required")
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format"),
  endTime: z
    .string()
    .trim()
    .min(1, "End time is required")
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format")
}).refine((values) => values.endTime > values.startTime, {
  message: "End time must be later than start time",
  path: ["endTime"]
});

export type TaskFormData = z.infer<typeof taskSchema>;
