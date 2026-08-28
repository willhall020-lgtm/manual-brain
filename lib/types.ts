import type { TimeOfDay } from "./time-of-day";

export interface Task {
  id: string;
  sectionId: string;
  name: string;
  dueDate: string | null; // "YYYY-MM-DD", or null for no due date
  doneAt: string | null;
  calendarEventId: string | null;
  durationMinutes: number | null;
  timeOfDay: TimeOfDay | null; // preferred rough slot for booking, or null for no preference
}

export interface Section {
  id: string;
  name: string;
}

export interface StateResponse {
  sections: (Section & { tasks: Omit<Task, "sectionId">[] })[];
}
