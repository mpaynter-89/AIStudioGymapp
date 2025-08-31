export enum ExerciseType {
  REPS_WEIGHT = 'Reps & Weight',
  TIMED = 'Timed',
  CARDIO = 'Cardio',
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
}

export interface ExerciseInstance {
  id: string;
  name: string;
  type: ExerciseType;
  sets: number;
  reps?: number;
  targetWeight?: number;
  duration?: number;
  distance?: number;
  rest: number; // For single exercises: inter-set rest. For circuits: intra-circuit rest.
}

export interface ExerciseGroup {
  id: string;
  type: 'single' | 'superset' | 'circuit';
  exercises: ExerciseInstance[];
  sets?: number; // For circuits: number of rounds
  rest?: number; // For circuits: rest between rounds
}

export interface WorkoutDay {
  id: string;
  name: string;
  exerciseGroups: ExerciseGroup[];
}

export interface WorkoutWeek {
  id: string;
  name: string;
  days: (WorkoutDay | null)[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  weeks: WorkoutWeek[];
}

export interface SetLog {
  setIndex: number;
  reps?: number;
  weight?: number;
  duration?: number;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseInstanceId: string;
  exerciseName: string;
  sets: SetLog[]; // For circuits, this will log per round
}

export interface WorkoutLog {
  id: string;
  planName: string;
  dayName: string;
  date: string;
  duration: number;
  exercises: ExerciseLog[];
}

export interface ActivePlanConfig {
  planId: string;
  startDate: string; // ISO Date string e.g., "2023-10-27"
  // Maps day of week (0=Sun, 1=Mon, ..., 6=Sat) to a WorkoutDay ID.
  dayMapping: Record<number, string | null>;
}