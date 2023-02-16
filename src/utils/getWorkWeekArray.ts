import { getWeekNumber } from "./getWeek";

export function getWorkWeekArray(weekNumber: number, year: number): Date[] {
  const workWeek: Date[] = [];
  const currentDate: Date = new Date(Date.UTC(year, 0, 1));

  // Berechne den Montag für die angegebene Woche
  while (getWeekNumber(currentDate) < weekNumber) {
    currentDate.setDate(currentDate.getDate() + 7);
  }

  // Füge jeden Tag der Arbeitswoche hinzu
  for (let i = 0; i < 5; i++) {
    workWeek.push(new Date(currentDate.getTime()));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workWeek;
}
