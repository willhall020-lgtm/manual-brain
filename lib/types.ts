import type { TimeOfDay } from "./time-of-day";
import type { RepeatFrequency } from "./repeat";

export interface Task {
  id: string;
  sectionId: string;
  name: string;
  dueDate: string | null; // "YYYY-MM-DD", or null for no due date
  doneAt: string | null;
  calendarEventId: string | null;
  durationMinutes: number | null;
  timeOfDay: TimeOfDay | null; // preferred rough slot for booking, or null for no preference
  repeatFrequency: RepeatFrequency | null; // only meaningful alongside dueDate
  assignedTo: string | null; // free-text name of who this is assigned to, or null for unassigned
}

export interface Section {
  id: string;
  name: string;
}

export interface StateResponse {
  sections: (Section & { tasks: Omit<Task, "sectionId">[] })[];
}
