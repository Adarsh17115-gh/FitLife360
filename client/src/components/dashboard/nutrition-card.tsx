import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatTime, calculateProgress } from "@/lib/utils";
import { Plus, Coffee, Utensils, Soup, MessageSquare } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAIMealRecommendations } from "@/lib/ai";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const mealFormSchema = z.object({
  name: z.string().min(3, { message: "Meal name must be at least 3 characters" }),
  calories: z.number().min(1, { message: "Calories must be at least 1" }),
  protein: z.number().min(0, { message: "Protein must be a positive number" }),
  mealType: z.string(),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

export default function NutritionCard() {
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isRequestingAI, setIsRequestingAI] = useState(false);
  
  const { data: meals, isLoading } = useQuery({
    queryKey: ['/api/users/1/meals'],
  });
  
  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: "",
      calories: 0,
      protein: 0,
      mealType: "breakfast",
    },
  });
  
  const addMealMutation = useMutation({
    mutationFn: async (meal: MealFormValues) => {
      return await apiRequest("POST", "/api/meals", {
        ...meal,
        userId: 1,
        timestamp: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/meals'] });
      setIsAddMealOpen(false);
      form.reset();
      toast({
        title: "Meal Added",
        description: "Your meal has been added successfully",
      });
    },
  });
  
  const onSubmit = (data: MealFormValues) => {
    addMealMutation.mutate(data);
  };
  
  const requestMealRecommendations = async () => {
    setIsRequestingAI(true);
    try {
      const recommendations = await getAIMealRecommendations(1);
      toast({
        title: "Meal Recommendations",
        description: "Check your AI Coach for personalized meal recommendations",
      });
    } catch (error) {
      console.error("Error getting meal recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to get meal recommendations",
        variant: "destructive",
      });
    } finally {
      setIsRequestingAI(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Today's Nutrition</CardTitle>
            <Button size="sm" className="h-8">
              <Plus className="mr-2 h-4 w-4" />
              Add Meal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
          <Skeleton className="h-5 w-32 mb-3" />
          <div className="space-y-3">
            <Skeleton className="h-[68px] w-full" />
            <Skeleton className="h-[68px] w-full" />
            <Skeleton className="h-[68px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Use sample data if no meals are returned
  const todaysMeals = meals?.length > 0 ? meals : [
    {
      id: 1,
      userId: 1,
      name: "Oatmeal with berries",
      calories: 320,
      protein: 12,
      timestamp: new Date(new Date().setHours(7, 45, 0, 0)),
      mealType: "breakfast"
    },
    {
      id: 2,
      userId: 1,
      name: "Grilled chicken salad",
      calories: 450,
      protein: 35,
      timestamp: new Date(new Date().setHours(12, 30, 0, 0)),
      mealType: "lunch"
    },
    {
      id: 3,
      userId: 1,
      name: "Greek yogurt with nuts",
      calories: 180,
      protein: 15,
      timestamp: new Date(new Date().setHours(15, 15, 0, 0)),
      mealType: "snack"
    }
  ];
  
  // Calculate totals
  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0);
  
  // Goals
  const calorieGoal = 2000;
  const proteinGoal = 120;
  const waterGoal = 2.5; // liters
  
  // Current water intake (hardcoded for now)
  const waterIntake = 1.2;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Today's Nutrition</CardTitle>
          <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="mr-2 h-4 w-4" />
                Add Meal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Meal</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Grilled Chicken Salad" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="calories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calories</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="protein"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protein (g)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="mealType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Type</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            {...field}
                          >
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={addMealMutation.isPending}>
                      {addMealMutation.isPending ? "Adding..." : "Add Meal"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 text-center">
            <div className="font-medium">Calories</div>
            <div className="mt-1 text-2xl font-bold">{totalCalories}</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">/ {calorieGoal} kcal</div>
            <div className="mt-2 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-700">
              <div 
                className="h-1 rounded-full bg-primary" 
                style={{ width: `${calculateProgress(totalCalories, calorieGoal)}%` }}
              ></div>
            </div>
          </div>
          <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 text-center">
            <div className="font-medium">Protein</div>
            <div className="mt-1 text-2xl font-bold">{totalProtein}g</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">/ {proteinGoal}g</div>
            <div className="mt-2 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-700">
              <div 
                className="h-1 rounded-full bg-primary" 
                style={{ width: `${calculateProgress(totalProtein, proteinGoal)}%` }}
              ></div>
            </div>
          </div>
          <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 text-center">
            <div className="font-medium">Water</div>
            <div className="mt-1 text-2xl font-bold">{waterIntake}L</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">/ {waterGoal}L</div>
            <div className="mt-2 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-700">
              <div 
                className="h-1 rounded-full bg-primary" 
                style={{ width: `${calculateProgress(waterIntake, waterGoal)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Meals Today</h3>
        <div className="space-y-3">
          {todaysMeals.map((meal) => (
            <div key={meal.id} className="flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  {meal.mealType === "breakfast" && <Coffee className="h-4 w-4 text-primary" />}
                  {meal.mealType === "lunch" && <Utensils className="h-4 w-4 text-primary" />}
                  {meal.mealType === "dinner" && <Utensils className="h-4 w-4 text-primary" />}
                  {meal.mealType === "snack" && <Soup className="h-4 w-4 text-primary" />}
                </div>
                <div>
                  <h4 className="font-medium">{meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{meal.name}</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{meal.calories} kcal</div>
                <div className="text-gray-500 dark:text-gray-400">{formatTime(meal.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button 
            className="w-full" 
            onClick={requestMealRecommendations}
            disabled={isRequestingAI}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {isRequestingAI ? "Requesting..." : "Ask AI for Meal Recommendations"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
