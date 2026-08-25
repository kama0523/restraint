export interface SavingsDay {
  date: string;
  amount: number;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  target_amount: number;
  title: string | null;
  achieved_at: string | null;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface HabitRecord {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  amount: number;
  created_at: string;
}

export interface HabitRecordWithHabit extends HabitRecord {
  habits: Pick<Habit, "name" | "color"> | null;
}
