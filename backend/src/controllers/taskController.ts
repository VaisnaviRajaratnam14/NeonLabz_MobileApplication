import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { Task } from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const withValidTimeRange = <T extends { startTime?: string; endTime?: string }>(values: T) => {
  if (!values.startTime || !values.endTime) {
    return true;
  }

  return values.endTime > values.startTime;
};

const taskPayloadBaseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().min(1, "Description is required").max(500),
  dueDate: z.coerce.date({
    required_error: "Due date is required",
    invalid_type_error: "Due date must be a valid ISO date"
  }),
  startTime: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must use HH:MM format"),
  endTime: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "End time must use HH:MM format")
});

const taskPayloadSchema = taskPayloadBaseSchema.refine(withValidTimeRange, {
  message: "End time must be later than start time",
  path: ["endTime"]
});

const taskUpdateSchema = taskPayloadBaseSchema.partial().refine(withValidTimeRange, {
  message: "End time must be later than start time",
  path: ["endTime"]
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const payload = taskPayloadSchema.parse(req.body);
  const task = await Task.create(payload);

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: task
  });
});

export const getTasks = asyncHandler(async (_req: Request, res: Response) => {
  const tasks = await Task.find().sort({ dueDate: 1, createdAt: -1 });

  res.status(StatusCodes.OK).json({
    success: true,
    data: tasks
  });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: task
  });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const payload = taskUpdateSchema.parse(req.body);

  const task = await Task.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: task
  });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Task deleted successfully"
  });
});
