export interface Task {
  id: string;
  sectionId: string;
  name: string;
  dueDate: string | null; // "YYYY-MM-DD", or null for no due date
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
