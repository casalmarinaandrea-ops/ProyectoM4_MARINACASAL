import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";

import { db } from "./firebase";
import type { Task, TaskInput } from "../types";

function taskCollection(uid: string) {
  if (!db) {
    throw new Error("Firebase no configurado");
  }

  return collection(db, "users", uid, "tasks");
}

export function subscribeTasks(
  uid: string,
  next: (tasks: Task[]) => void,
  error: (error: unknown) => void,
) {
  const tasksQuery = query(
    taskCollection(uid),
    where("userId", "==", uid),
  );

  return onSnapshot(
    tasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          ...data,
          id: document.id,
          createdAt:
            (data.createdAt as Timestamp | null)?.toMillis() ?? 0,
          updatedAt:
            (data.updatedAt as Timestamp | null)?.toMillis() ?? 0,
        } as Task;
      });

      next(tasks);
    },
    error,
  );
}

export const createTask = (uid: string, input: TaskInput) =>
  addDoc(taskCollection(uid), {
    title: input.title.trim(),
    description: input.description.trim(),
    priority: input.priority,
    dueDate: input.dueDate,
    completed: false,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

export const editTask = (
  uid: string,
  id: string,
  input: TaskInput,
) =>
  updateDoc(doc(taskCollection(uid), id), {
    title: input.title.trim(),
    description: input.description.trim(),
    priority: input.priority,
    dueDate: input.dueDate,
    updatedAt: serverTimestamp(),
  });

export const toggleTask = (
  uid: string,
  id: string,
  completed: boolean,
) =>
  updateDoc(doc(taskCollection(uid), id), {
    completed,
    updatedAt: serverTimestamp(),
  });

export const removeTask = (uid: string, id: string) =>
  deleteDoc(doc(taskCollection(uid), id));