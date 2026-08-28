import type { UrgencyKey } from "./urgency";

export interface Task {
  id: string;
  sectionId: string;
  name: string;
  urgency: UrgencyKey;
  customLabel: string | null;
  doneAt: string | null;
  calendarEventId: string | null;
  durationMinutes: number | null;
}

export interface Section {
  id: string;
  name: string;
}

export interface StateResponse {
  sections: (Section & { tasks: Omit<Task, "sectionId">[] })[];
}
