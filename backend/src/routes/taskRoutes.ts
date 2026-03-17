import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask
} from "../controllers/taskController.js";

const taskRouter = Router();

taskRouter.get("/", getTasks);
taskRouter.post("/", createTask);
taskRouter.get("/:id", getTaskById);
taskRouter.patch("/:id", updateTask);
taskRouter.delete("/:id", deleteTask);

export { taskRouter };
