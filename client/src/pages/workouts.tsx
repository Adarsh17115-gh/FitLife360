import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { WorkoutPlan, WorkoutLevel } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarPlus, Clock, Dumbbell, Play, Plus, Search, Trash2, User, Filter } from "lucide-react";

const workoutFormSchema = z.object({
  name: z.string().min(2, "Workout name must be at least 2 characters long"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  type: z.string().min(1, "Workout type is required"),
});

export default function Workouts() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: workouts, isLoading, error } = useQuery<WorkoutPlan[]>({
    queryKey: ['/api/workouts'],
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (newWorkout: z.infer<typeof workoutFormSchema>) => {
      return apiRequest("POST", "/api/workouts", newWorkout);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      toast({
        title: "Success",
        description: "Workout created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create workout: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof workoutFormSchema>>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: "",
      duration: 30,
      level: "beginner",
      type: "strength",
    },
  });

  const onSubmit = (values: z.infer<typeof workoutFormSchema>) => {
    createWorkoutMutation.mutate(values);
  };

  const filteredWorkouts = workouts?.filter(workout => 
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelBadgeClass = (level: WorkoutLevel) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300";
      case "intermediate":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300";
      case "advanced":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold">Workouts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage your workout routines</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search workouts..."
              className="pl-8 w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Workout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Workouts</TabsTrigger>
              <TabsTrigger value="my">My Workouts</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="ai">AI Recommended</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* All Workouts Tab */}
          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center gap-2 mt-4">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-full rounded-md" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                Failed to load workouts. Please try again later.
              </div>
            ) : filteredWorkouts && filteredWorkouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkouts.map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{workout.name}</CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeClass(workout.level)}`}>
                          {workout.level.charAt(0).toUpperCase() + workout.level.slice(1)}
                        </span>
                      </div>
                      <CardDescription>{workout.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {workout.description || "No description available."}
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="mr-1 h-4 w-4" />
                          {workout.duration} mins
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Dumbbell className="mr-1 h-4 w-4" />
                          {workout.exercises?.length || 0} exercises
                        </div>
                        {workout.createdBy && (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <User className="mr-1 h-4 w-4" />
                            {workout.createdBy}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Start Workout
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                {searchQuery ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">No workouts found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No workouts matching "{searchQuery}" were found. Try a different search term.
                    </p>
                    <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">No workouts available</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Create your first workout to get started.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Workout
                    </Button>
                  </>
                )}
              </div>
            )}
          </TabsContent>

          {/* My Workouts Tab */}
          <TabsContent value="my">
            <div className="text-center py-12">
              <CalendarPlus className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">You haven't created any workouts yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create your own workout routines tailored to your fitness goals.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Workout
              </Button>
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-12 w-12 mx-auto text-gray-400 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No favorite workouts yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add workouts to your favorites for quick access.
              </p>
              <Button variant="outline">Browse Workouts</Button>
            </div>
          </TabsContent>

          {/* AI Recommended Tab */}
          <TabsContent value="ai">
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-12 w-12 mx-auto text-gray-400 mb-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">AI recommendations coming soon</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get personalized workout suggestions based on your fitness goals and progress.
              </p>
              <Button variant="outline">Explore Other Workouts</Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Workout Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Create Workout</DialogTitle>
                  <DialogDescription>
                    Create a new workout routine. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Full Body HIIT" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Strength, Cardio, Flexibility" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Difficulty Level</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="beginner" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Beginner
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="intermediate" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Intermediate
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="advanced" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Advanced
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createWorkoutMutation.isPending}>
                    {createWorkoutMutation.isPending ? "Creating..." : "Create Workout"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
