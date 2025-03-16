// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  height: number;
  weight: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Health Data Types
export interface HealthData {
  heartRate: {
    current: number;
    min: number;
    max: number;
  };
  steps: {
    current: number;
    goal: number;
    percentComplete: number;
  };
  sleep: {
    current: number;
    goal: number;
    percentComplete: number;
  };
  calories: {
    current: number;
    goal: number;
    percentComplete: number;
  };
}

export interface ActivityData {
  activities: {
    day: string;
    steps: number;
    calories: number;
  }[];
}

// Family Types
export interface FamilyMember {
  id: number;
  name: string;
  avatar?: string;
  relationship: string;
  age: number;
  isCurrentUser: boolean;
  status: 'online' | 'away' | 'offline';
  lastActive?: string;
  dailyGoalPercent: number;
  streak: number;
}

// Workout Types
export type WorkoutLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WorkoutPlan {
  id: number;
  name: string;
  description?: string;
  type: string;
  level: WorkoutLevel;
  duration: number;
  exercises?: WorkoutExercise[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutExercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  restTime?: number;
  instructions?: string;
}

// Nutrition Types
export interface NutritionGoals {
  currentCalories: number;
  goalCalories: number;
  currentProtein: number;
  goalProtein: number;
  currentCarbs: number;
  goalCarbs: number;
  currentFat: number;
  goalFat: number;
  currentWater: number;
  goalWater: number;
  currentFiber: number;
  goalFiber: number;
}

export interface MealPlan {
  id: number;
  name: string;
  date: string;
  meals: MealEntry[];
}

export interface MealEntry {
  id: number;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

// Challenge Types
export interface Challenge {
  id: number;
  name: string;
  description: string;
  type: 'steps' | 'workout' | 'nutrition';
  status: 'active' | 'upcoming' | 'completed';
  timeLeft: string;
  goal: number;
  current: number;
  unit: string;
  progress: number;
  participants: {
    id: number;
    name: string;
    avatar?: string;
    progress: number;
  }[];
}

// Activity Types
export type HealthMetricType = 'all' | 'heartRate' | 'steps' | 'sleep' | 'calories' | 'weight';

export interface HealthMetricsData {
  metrics: {
    type: HealthMetricType;
    name: string;
    current: number;
    goal?: number;
    unit: string;
    change: number;
  }[];
  chartData: {
    date: string;
    heartRate: number;
    steps: number;
    sleep: number;
    calories: number;
    weight: number;
  }[];
}

// Activities and Upcoming Types
export interface UpcomingActivity {
  id: number;
  title: string;
  description: string;
  type: 'workout' | 'challenge' | 'nutrition';
  status: string;
  progress?: {
    current: number;
    goal: number;
    percent: number;
  };
}
