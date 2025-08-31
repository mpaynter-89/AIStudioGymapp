import type { WorkoutPlan, WorkoutWeek, WorkoutDay, ExerciseGroup, ExerciseInstance } from '../types';
import { ExerciseType } from '../types';

const day1: WorkoutDay = {
  id: 'day1',
  name: 'Push Day (Chest, Shoulders, Triceps)',
  exerciseGroups: [
    {
      id: 'group1',
      type: 'single',
      exercises: [
        { id: 'ex1', name: 'Bench Press', type: ExerciseType.REPS_WEIGHT, sets: 4, reps: 8, targetWeight: 60, rest: 90 },
      ],
    },
    {
      id: 'group2',
      type: 'single',
      exercises: [
        { id: 'ex2', name: 'Overhead Press', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 10, targetWeight: 40, rest: 60 },
      ],
    },
    {
      id: 'group3',
      type: 'superset',
      exercises: [
        { id: 'ex3', name: 'Incline Dumbbell Press', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 12, targetWeight: 20, rest: 10 },
        { id: 'ex4', name: 'Push-ups', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 15, rest: 90 },
      ],
    },
    {
      id: 'group4',
      type: 'single',
      exercises: [
        { id: 'ex5', name: 'Tricep Pushdowns', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 15, targetWeight: 25, rest: 45 },
      ],
    },
  ],
};

const day2: WorkoutDay = {
  id: 'day2',
  name: 'Pull Day (Back, Biceps)',
  exerciseGroups: [
    {
      id: 'group5',
      type: 'single',
      exercises: [
        { id: 'ex6', name: 'Deadlifts', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 5, targetWeight: 100, rest: 120 },
      ],
    },
    {
      id: 'group6',
      type: 'single',
      exercises: [
        { id: 'ex7', name: 'Pull-ups', type: ExerciseType.REPS_WEIGHT, sets: 4, reps: 8, rest: 90 },
      ],
    },
    {
      id: 'group7',
      type: 'single',
      exercises: [
        { id: 'ex8', name: 'Barbell Rows', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 10, targetWeight: 50, rest: 60 },
      ],
    },
    {
      id: 'group8',
      type: 'superset',
      exercises: [
        { id: 'ex9', name: 'Face Pulls', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 15, targetWeight: 15, rest: 10 },
        { id: 'ex10', name: 'Bicep Curls', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 12, targetWeight: 12, rest: 60 },
      ],
    },
  ],
};

const day3: WorkoutDay = {
  id: 'day3',
  name: 'Leg Day',
  exerciseGroups: [
    {
      id: 'group9',
      type: 'single',
      exercises: [
        { id: 'ex11', name: 'Squats', type: ExerciseType.REPS_WEIGHT, sets: 4, reps: 8, targetWeight: 80, rest: 120 },
      ],
    },
    {
      id: 'group10',
      type: 'single',
      exercises: [
        { id: 'ex12', name: 'Romanian Deadlifts', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 12, targetWeight: 60, rest: 90 },
      ],
    },
     {
      id: 'group11',
      type: 'single',
      exercises: [
        { id: 'ex13', name: 'Leg Press', type: ExerciseType.REPS_WEIGHT, sets: 3, reps: 15, targetWeight: 120, rest: 60 },
      ],
    },
     {
      id: 'group12',
      type: 'single',
      exercises: [
        { id: 'ex14', name: 'Calf Raises', type: ExerciseType.REPS_WEIGHT, sets: 4, reps: 20, targetWeight: 30, rest: 45 },
      ],
    },
  ],
};

const day4: WorkoutDay = {
    id: 'day4',
    name: 'HIIT & Core',
    exerciseGroups: [
        {
            id: 'circuit1',
            type: 'circuit',
            sets: 4, // Number of rounds
            rest: 90, // Rest between rounds
            exercises: [
                {id: 'hiit1', name: 'Burpees', type: ExerciseType.TIMED, sets: 1, duration: 45, rest: 15},
                {id: 'hiit2', name: 'Kettlebell Swings', type: ExerciseType.TIMED, sets: 1, duration: 45, rest: 15},
                {id: 'hiit3', name: 'Jump Squats', type: ExerciseType.TIMED, sets: 1, duration: 45, rest: 15},
                {id: 'hiit4', name: 'Plank', type: ExerciseType.TIMED, sets: 1, duration: 60, rest: 0}, // No rest after last exercise in round
            ]
        }
    ]
}

const week1: WorkoutWeek = {
  id: 'week1',
  name: 'Week 1',
  days: [day1, day2, null, day3, day4, null, null], // Push, Pull, Rest, Legs, HIIT, Rest, Rest
};

export const samplePlan: WorkoutPlan = {
  id: 'plan1',
  name: '4-Day Split Foundation',
  weeks: [week1],
};