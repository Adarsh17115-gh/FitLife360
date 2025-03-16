import { pgTable, text, serial, integer, boolean, timestamp, json, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  gender: text("gender").default("other"),
  dateOfBirth: text("date_of_birth"),
  height: integer("height").default(170),
  weight: integer("weight").default(70),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family Members Table
export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  avatar: text("avatar"),
  relationship: text("relationship").notNull(),
  age: integer("age").notNull(),
  status: text("status").default("offline"),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health Metrics Table
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  heartRate: integer("heart_rate"),
  steps: integer("steps"),
  calories: integer("calories"),
  sleep: integer("sleep"),
  weight: integer("weight"),
  water: integer("water"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Nutrition Goals Table
export const nutritionGoals = pgTable("nutrition_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  goalCalories: integer("goal_calories").default(2000),
  goalProtein: integer("goal_protein").default(150),
  goalCarbs: integer("goal_carbs").default(200),
  goalFat: integer("goal_fat").default(70),
  goalWater: integer("goal_water").default(8),
  goalFiber: integer("goal_fiber").default(30),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meals Table
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  time: timestamp("time").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workouts Table
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  level: text("level").notNull().default("beginner"),
  duration: integer("duration").notNull(),
  exercises: json("exercises"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Challenges Table
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goal: integer("goal").notNull(),
  unit: text("unit").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Challenge Participants Table
export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  userId: integer("user_id").notNull().references(() => users.id),
  progress: integer("progress").notNull().default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Activity Logs Table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration"),
  calories: integer("calories"),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActive: true,
});

export const insertHealthMetricSchema = createInsertSchema(healthMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNutritionGoalSchema = createInsertSchema(nutritionGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type InsertHealthMetric = z.infer<typeof insertHealthMetricSchema>;
export type InsertNutritionGoal = z.infer<typeof insertNutritionGoalSchema>;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Select Types
export type User = typeof users.$inferSelect;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type NutritionGoal = typeof nutritionGoals.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
