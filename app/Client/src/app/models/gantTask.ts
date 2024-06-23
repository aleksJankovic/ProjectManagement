export interface GanttTask {
  taskId: string;
  taskName: string;
  resource: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  percentComplete: number;
  dependencies: string | null;
}
