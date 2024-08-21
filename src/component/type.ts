export type PushAlert = {
  id: number;
  title: string;
  frequency: string;
  status: string;
  startDate: string;
  endDate: string;
  OS: string[];
  sent: number;
  openRatio: number;
};
