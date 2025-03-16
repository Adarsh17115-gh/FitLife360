import {
  User, InsertUser,
  FamilyMember, InsertFamilyMember,
  HealthMetric, InsertHealthMetric,
  NutritionGoal, InsertNutritionGoal,
  Meal, InsertMeal,
  Workout, InsertWorkout,
  Challenge, InsertChallenge,
  ChallengeParticipant, InsertChallengeParticipant
} from "@shared/schema";
import { 
  HealthData, 
  ActivityData, 
  UpcomingActivity, 
  MealPlan, 
  HealthMetricsData,
  FamilyMember as FamilyMemberType,
  Challenge as ChallengeType,
  NutritionGoals as NutritionGoalsType
} from "@/types";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Family methods
  getFamilyMembers(userId: number): Promise<FamilyMemberType[]>;
  addFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  
  // Health methods
  getHealthSummary(userId: number): Promise<HealthData>;
  getHealthMetrics(userId: number, timeRange: string, metricType: string): Promise<HealthMetricsData>;
  addHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric>;
  getWeeklyActivity(userId: number): Promise<ActivityData>;
  
  // Activity methods
  getUpcomingActivities(userId: number): Promise<UpcomingActivity[]>;
  
  // Nutrition methods
  getNutritionGoals(userId: number): Promise<NutritionGoalsType>;
  updateNutritionGoals(userId: number, goals: Partial<InsertNutritionGoal>): Promise<NutritionGoal>;
  getMealPlan(userId: number, date: string): Promise<MealPlan>;
  addMeal(meal: InsertMeal): Promise<Meal>;
  
  // Workout methods
  getWorkouts(userId: number): Promise<Workout[]>;
  addWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Challenge methods
  getChallenges(userId: number): Promise<ChallengeType[]>;
  addChallenge(challenge: InsertChallenge, userId: number): Promise<Challenge>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private familyMembers: Map<number, FamilyMember>;
  private healthMetrics: Map<number, HealthMetric>;
  private nutritionGoals: Map<number, NutritionGoal>;
  private meals: Map<number, Meal>;
  private workouts: Map<number, Workout>;
  private challenges: Map<number, Challenge>;
  private challengeParticipants: Map<number, ChallengeParticipant>;
  
  private userIdCounter: number = 1;
  private familyMemberIdCounter: number = 1;
  private healthMetricIdCounter: number = 1;
  private nutritionGoalIdCounter: number = 1;
  private mealIdCounter: number = 1;
  private workoutIdCounter: number = 1;
  private challengeIdCounter: number = 1;
  private challengeParticipantIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.familyMembers = new Map();
    this.healthMetrics = new Map();
    this.nutritionGoals = new Map();
    this.meals = new Map();
    this.workouts = new Map();
    this.challenges = new Map();
    this.challengeParticipants = new Map();
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: 1,
      username: "emma.johnson",
      email: "emma@example.com",
      password: "hashed_password",
      name: "Emma Johnson",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&auto=format&fit=crop",
      gender: "female",
      dateOfBirth: "1990-05-15",
      height: 168,
      weight: 65,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(sampleUser.id, sampleUser);
    this.userIdCounter++;

    // Create sample family members
    const familyMembers: Partial<FamilyMember>[] = [
      {
        id: 1,
        userId: 1,
        name: "Michael Johnson",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&h=100&auto=format&fit=crop",
        relationship: "Spouse",
        age: 36,
        status: "online",
        lastActive: new Date()
      },
      {
        id: 2,
        userId: 1,
        name: "Sophia Johnson",
        avatar: "https://images.unsplash.com/photo-1517677129300-07b130802f46?q=80&w=100&h=100&auto=format&fit=crop",
        relationship: "Daughter",
        age: 12,
        status: "away",
        lastActive: new Date(Date.now() - 30 * 60000)
      },
      {
        id: 3,
        userId: 1,
        name: "Ethan Johnson",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=100&h=100&auto=format&fit=crop",
        relationship: "Son",
        age: 10,
        status: "offline",
        lastActive: new Date(Date.now() - 2 * 3600000)
      }
    ];

    familyMembers.forEach(member => {
      this.familyMembers.set(member.id!, member as FamilyMember);
      this.familyMemberIdCounter++;
    });

    // Create sample nutrition goals
    const sampleNutritionGoal: NutritionGoal = {
      id: 1,
      userId: 1,
      goalCalories: 2000,
      goalProtein: 150,
      goalCarbs: 200,
      goalFat: 70,
      goalWater: 8,
      goalFiber: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.nutritionGoals.set(sampleNutritionGoal.id, sampleNutritionGoal);
    this.nutritionGoalIdCounter++;

    // Create sample workouts
    const workouts: Partial<Workout>[] = [
      {
        id: 1,
        userId: 1,
        name: "Full Body HIIT",
        description: "High-intensity interval training targeting all major muscle groups",
        type: "HIIT",
        level: "intermediate",
        duration: 30,
        exercises: [
          { name: "Jumping Jacks", sets: 1, reps: 30 },
          { name: "Push-ups", sets: 3, reps: 10 },
          { name: "Bodyweight Squats", sets: 3, reps: 15 },
          { name: "Mountain Climbers", sets: 3, reps: 20 },
          { name: "Plank", sets: 3, reps: 1, duration: 30 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        name: "Upper Body Strength",
        description: "Focused on building strength in arms, chest, and back",
        type: "Strength",
        level: "beginner",
        duration: 45,
        exercises: [
          { name: "Push-ups", sets: 3, reps: 10 },
          { name: "Dumbbell Rows", sets: 3, reps: 12 },
          { name: "Shoulder Press", sets: 3, reps: 10 },
          { name: "Bicep Curls", sets: 3, reps: 12 },
          { name: "Tricep Dips", sets: 3, reps: 10 }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    workouts.forEach(workout => {
      this.workouts.set(workout.id!, workout as Workout);
      this.workoutIdCounter++;
    });

    // Create sample challenges
    const challenges: Partial<Challenge>[] = [
      {
        id: 1,
        name: "10K Steps Challenge",
        description: "Complete 10,000 steps daily for a week",
        type: "steps",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 3600000),
        goal: 70000,
        unit: "steps",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: "Drink More Water",
        description: "Drink 8 glasses of water daily for 14 days",
        type: "nutrition",
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 3600000),
        goal: 112,
        unit: "glasses",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    challenges.forEach(challenge => {
      this.challenges.set(challenge.id!, challenge as Challenge);
      this.challengeIdCounter++;
    });

    // Create sample challenge participants
    const participants: Partial<ChallengeParticipant>[] = [
      {
        id: 1,
        challengeId: 1,
        userId: 1,
        progress: 18429,
        joinedAt: new Date()
      },
      {
        id: 2,
        challengeId: 1,
        userId: 2,
        progress: 25000,
        joinedAt: new Date()
      },
      {
        id: 3,
        challengeId: 2,
        userId: 1,
        progress: 16,
        joinedAt: new Date()
      }
    ];

    participants.forEach(participant => {
      this.challengeParticipants.set(participant.id!, participant as ChallengeParticipant);
      this.challengeParticipantIdCounter++;
    });

    // Create sample meals
    const meals: Partial<Meal>[] = [
      {
        id: 1,
        userId: 1,
        name: "Breakfast - Oatmeal with Fruit",
        time: new Date(new Date().setHours(8, 30)),
        calories: 350,
        protein: 12,
        carbs: 60,
        fat: 8,
        notes: "Added honey and cinnamon",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        userId: 1,
        name: "Lunch - Grilled Chicken Salad",
        time: new Date(new Date().setHours(12, 45)),
        calories: 450,
        protein: 35,
        carbs: 25,
        fat: 18,
        notes: "Used olive oil dressing",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        userId: 1,
        name: "Snack - Protein Shake",
        time: new Date(new Date().setHours(16, 0)),
        calories: 180,
        protein: 25,
        carbs: 10,
        fat: 3,
        notes: "Post-workout",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    meals.forEach(meal => {
      this.meals.set(meal.id!, meal as Meal);
      this.mealIdCounter++;
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...user,
      ...userData,
      id, // Ensure id isn't changed
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Family methods
  async getFamilyMembers(userId: number): Promise<FamilyMemberType[]> {
    const members = Array.from(this.familyMembers.values())
      .filter(member => member.userId === userId)
      .map(member => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        relationship: member.relationship,
        age: member.age,
        isCurrentUser: false,
        status: member.status as 'online' | 'away' | 'offline',
        lastActive: member.lastActive?.toISOString(),
        dailyGoalPercent: Math.floor(Math.random() * 40) + 45, // Random progress between 45-85%
        streak: Math.floor(Math.random() * 7) + 1 // Random streak between 1-7 days
      }));
    
    // Add the user themselves
    const user = await this.getUser(userId);
    if (user) {
      members.unshift({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        relationship: "Self",
        age: this.calculateAge(user.dateOfBirth),
        isCurrentUser: true,
        status: 'online',
        dailyGoalPercent: 84,
        streak: 5
      });
    }
    
    return members;
  }

  private calculateAge(dateOfBirth: string | undefined): number {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  async addFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const id = this.familyMemberIdCounter++;
    const now = new Date();
    const newMember: FamilyMember = {
      id,
      ...member,
      status: "offline",
      lastActive: now,
      createdAt: now,
      updatedAt: now
    };
    this.familyMembers.set(id, newMember);
    return newMember;
  }

  // Health methods
  async getHealthSummary(userId: number): Promise<HealthData> {
    return {
      heartRate: {
        current: 72,
        min: 60,
        max: 100
      },
      steps: {
        current: 8429,
        goal: 10000,
        percentComplete: 84
      },
      sleep: {
        current: 7.5,
        goal: 8,
        percentComplete: 94
      },
      calories: {
        current: 1842,
        goal: 2500,
        percentComplete: 73
      }
    };
  }

  async getHealthMetrics(userId: number, timeRange: string, metricType: string): Promise<HealthMetricsData> {
    const dateLabels = this.generateDateLabels(timeRange);
    
    return {
      metrics: [
        {
          type: 'heartRate',
          name: 'Heart Rate',
          current: 72,
          unit: 'BPM',
          change: +2
        },
        {
          type: 'steps',
          name: 'Steps',
          current: 8429,
          goal: 10000,
          unit: 'steps',
          change: +5
        },
        {
          type: 'sleep',
          name: 'Sleep',
          current: 7.5,
          goal: 8,
          unit: 'hours',
          change: -3
        },
        {
          type: 'calories',
          name: 'Calories',
          current: 1842,
          goal: 2500,
          unit: 'kcal',
          change: +8
        },
        {
          type: 'weight',
          name: 'Weight',
          current: 65,
          unit: 'kg',
          change: -1
        }
      ],
      chartData: dateLabels.map((date, index) => ({
        date,
        heartRate: 65 + Math.floor(Math.random() * 15),
        steps: 6000 + Math.floor(Math.random() * 6000),
        sleep: 6 + Math.random() * 3,
        calories: 1600 + Math.floor(Math.random() * 1000),
        weight: 64.5 + (Math.random() * 1.5),
      }))
    };
  }

  private generateDateLabels(timeRange: string): string[] {
    const today = new Date();
    const labels: string[] = [];
    
    if (timeRange === 'day') {
      // Hours in the day
      for (let i = 0; i < 24; i += 2) {
        const date = new Date(today);
        date.setHours(i, 0, 0, 0);
        labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } else if (timeRange === 'week') {
      // Days of the week
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1]);
      }
    } else if (timeRange === 'month') {
      // Days of the month
      const daysInMonth = 30;
      for (let i = 0; i < daysInMonth; i += 2) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysInMonth + i + 1);
        labels.push(`${date.getDate()}`);
      }
    } else if (timeRange === 'year') {
      // Months of the year
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        labels.push(monthNames[i]);
      }
    }
    
    return labels;
  }

  async addHealthMetric(metric: InsertHealthMetric): Promise<HealthMetric> {
    const id = this.healthMetricIdCounter++;
    const now = new Date();
    const newMetric: HealthMetric = {
      id,
      ...metric,
      createdAt: now,
      updatedAt: now
    };
    this.healthMetrics.set(id, newMetric);
    return newMetric;
  }

  async getWeeklyActivity(userId: number): Promise<ActivityData> {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return {
      activities: dayNames.map(day => ({
        day,
        steps: 6000 + Math.floor(Math.random() * 6000),
        calories: 1600 + Math.floor(Math.random() * 1000)
      }))
    };
  }

  // Activity methods
  async getUpcomingActivities(userId: number): Promise<UpcomingActivity[]> {
    return [
      {
        id: 1,
        title: "HIIT Workout",
        description: "5:30 PM - 30 minutes",
        type: "workout",
        status: "Today"
      },
      {
        id: 2,
        title: "Family Step Challenge",
        description: "8,429 / 50,000 steps",
        type: "challenge",
        status: "Ends in 2 days",
        progress: {
          current: 8429,
          goal: 50000,
          percent: 17
        }
      },
      {
        id: 3,
        title: "Meal Prep Reminder",
        description: "Protein-rich lunch recipes",
        type: "nutrition",
        status: "Tomorrow"
      }
    ];
  }

  // Nutrition methods
  async getNutritionGoals(userId: number): Promise<NutritionGoalsType> {
    const goals = Array.from(this.nutritionGoals.values())
      .find(goal => goal.userId === userId);
      
    if (!goals) {
      // Return default goals if none exist
      return {
        currentCalories: 1842,
        goalCalories: 2000,
        currentProtein: 120,
        goalProtein: 150,
        currentCarbs: 180,
        goalCarbs: 200,
        currentFat: 60,
        goalFat: 70,
        currentWater: 6,
        goalWater: 8,
        currentFiber: 25,
        goalFiber: 30
      };
    }
    
    return {
      currentCalories: 1842,
      goalCalories: goals.goalCalories,
      currentProtein: 120,
      goalProtein: goals.goalProtein,
      currentCarbs: 180,
      goalCarbs: goals.goalCarbs,
      currentFat: 60,
      goalFat: goals.goalFat,
      currentWater: 6,
      goalWater: goals.goalWater,
      currentFiber: 25,
      goalFiber: goals.goalFiber
    };
  }

  async updateNutritionGoals(userId: number, goalData: Partial<InsertNutritionGoal>): Promise<NutritionGoal> {
    // Check if goals exist for this user
    let existingGoals = Array.from(this.nutritionGoals.values())
      .find(goal => goal.userId === userId);
      
    if (!existingGoals) {
      // Create new goals if none exist
      existingGoals = {
        id: this.nutritionGoalIdCounter++,
        userId,
        goalCalories: 2000,
        goalProtein: 150,
        goalCarbs: 200,
        goalFat: 70,
        goalWater: 8,
        goalFiber: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    const updatedGoals: NutritionGoal = {
      ...existingGoals,
      ...goalData,
      updatedAt: new Date()
    };
    
    this.nutritionGoals.set(updatedGoals.id, updatedGoals);
    return updatedGoals;
  }

  async getMealPlan(userId: number, date: string): Promise<MealPlan> {
    const today = new Date(date);
    
    // Get meals for the specified date
    const meals = Array.from(this.meals.values())
      .filter(meal => {
        const mealDate = new Date(meal.time);
        return meal.userId === userId && 
               mealDate.getDate() === today.getDate() &&
               mealDate.getMonth() === today.getMonth() &&
               mealDate.getFullYear() === today.getFullYear();
      })
      .map(meal => ({
        id: meal.id,
        name: meal.name,
        time: meal.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        notes: meal.notes
      }));
    
    return {
      id: 1,
      name: "Today's Meals",
      date: today.toISOString().split('T')[0],
      meals
    };
  }

  async addMeal(mealData: InsertMeal): Promise<Meal> {
    const id = this.mealIdCounter++;
    const now = new Date();
    const meal: Meal = {
      id,
      ...mealData,
      time: new Date(mealData.time),
      createdAt: now,
      updatedAt: now
    };
    this.meals.set(id, meal);
    return meal;
  }

  // Workout methods
  async getWorkouts(userId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId);
  }

  async addWorkout(workoutData: InsertWorkout): Promise<Workout> {
    const id = this.workoutIdCounter++;
    const now = new Date();
    const workout: Workout = {
      id,
      ...workoutData,
      createdAt: now,
      updatedAt: now
    };
    this.workouts.set(id, workout);
    return workout;
  }

  // Challenge methods
  async getChallenges(userId: number): Promise<ChallengeType[]> {
    // Get all challenges where the user is a participant
    const participations = Array.from(this.challengeParticipants.values())
      .filter(participant => participant.userId === userId);
      
    const challengeIds = participations.map(p => p.challengeId);
    
    const results: ChallengeType[] = [];
    
    for (const challengeId of challengeIds) {
      const challenge = this.challenges.get(challengeId);
      if (!challenge) continue;
      
      // Get all participants for this challenge
      const allParticipants = Array.from(this.challengeParticipants.values())
        .filter(p => p.challengeId === challengeId);
        
      const participantDetails = await Promise.all(
        allParticipants.map(async p => {
          const user = await this.getUser(p.userId);
          return {
            id: p.userId,
            name: user?.name || `User ${p.userId}`,
            avatar: user?.avatar,
            progress: Math.round((p.progress / challenge.goal) * 100)
          };
        })
      );
      
      // Get the current user's progress
      const userParticipation = participations.find(p => p.challengeId === challengeId);
      
      results.push({
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        type: challenge.type as 'steps' | 'workout' | 'nutrition',
        status: challenge.status as 'active' | 'upcoming' | 'completed',
        timeLeft: this.getTimeLeft(challenge.endDate),
        goal: challenge.goal,
        current: userParticipation?.progress || 0,
        unit: challenge.unit,
        progress: Math.round(((userParticipation?.progress || 0) / challenge.goal) * 100),
        participants: participantDetails
      });
    }
    
    return results;
  }

  private getTimeLeft(endDate: Date): string {
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Ended";
    if (diffDays === 1) return "1 day";
    return `${diffDays} days`;
  }

  async addChallenge(challenge: InsertChallenge, userId: number): Promise<Challenge> {
    const id = this.challengeIdCounter++;
    const now = new Date();
    const newChallenge: Challenge = {
      id,
      ...challenge,
      createdAt: now,
      updatedAt: now
    };
    this.challenges.set(id, newChallenge);
    
    // Add the creator as the first participant
    const participantId = this.challengeParticipantIdCounter++;
    const participant: ChallengeParticipant = {
      id: participantId,
      challengeId: id,
      userId,
      progress: 0,
      joinedAt: now
    };
    this.challengeParticipants.set(participantId, participant);
    
    return newChallenge;
  }
}

export const storage = new MemStorage();
