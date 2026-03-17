import { Schema, model } from "mongoose";

export interface ITask {
  title: string;
  description: string;
  dueDate: Date;
  startTime: string;
  endTime: string;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    dueDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      trim: true
    },
    endTime: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const Task = model<ITask>("Task", taskSchema);
