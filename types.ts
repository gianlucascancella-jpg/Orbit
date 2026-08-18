export type EntryType = "income" | "expense";
export type Frequency = "once" | "monthly" | "weekly" | "yearly";

export interface Transaction {
  id: string;
  user_id?: string;
  title: string;
  type: EntryType;
  amount: number;
  date: string;
  frequency: Frequency;
  category: string;
  shift_weekend: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Settings {
  weekendShift: boolean;
  currency: string;
  safetyBuffer: number;
}

export interface AppState {
  transactions: Transaction[];
  settings: Settings;
}