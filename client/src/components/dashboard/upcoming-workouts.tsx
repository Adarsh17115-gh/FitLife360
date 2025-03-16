import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Play, BarChart, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const workoutFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  duration: z.number().min(1, { message: "Duration must be at least 1 minute" }),
  intensity: z.string(),
  imageUrl: z.string().url({ message: "Please enter a valid URL" }),
  scheduledAt: z.string(),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

export default function UpcomingWorkouts() {
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  
  const { data: upcomingWorkouts, isLoading } = useQuery({
    queryKey: ['/api/users/1/workouts/upcoming'],
  });

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 30,
      intensity: "Medium",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    },
  });

  const addWorkoutMutation = useMutation({
    mutationFn: async (workout: WorkoutFormValues) => {
      // First create the workout
      const workoutResponse = await apiRequest("POST", "/api/workouts", {
        ...workout,
        scheduledAt: new Date(workout.scheduledAt),
      });
      
      const newWorkout = await workoutResponse.json();
      
      // Then assign it to the current user
      return await apiRequest("POST", "/api/user-workouts", {
        userId: 1,
        workoutId: newWorkout.id,
        scheduledAt: new Date(workout.scheduledAt),
        completed: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/workouts/upcoming'] });
      setIsAddWorkoutOpen(false);
      form.reset();
      toast({
        title: "Workout Added",
        description: "Your workout has been scheduled successfully",
      });
    },
  });

  const onSubmit = (data: WorkoutFormValues) => {
    addWorkoutMutation.mutate(data);
  };

  const getImageForIntensity = (intensity: string): string => {
    switch (intensity.toLowerCase()) {
      case "high":
        return "https://images.unsplash.com/photo-1536922246289-88c42f957773?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
      case "low":
        return "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
      default:
        return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Workouts</CardTitle>
            <Button size="sm" className="h-8">
              <Plus className="mr-2 h-4 w-4" />
              Add Workout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use sample data if no workouts are returned
  const displayWorkouts = upcomingWorkouts?.length > 0 ? upcomingWorkouts : [
    {
      id: 1,
      userId: 1,
      workoutId: 1,
      scheduledAt: new Date(Date.now() + 86400000),
      completed: false,
      workout: {
        id: 1,
        title: "HIIT Training",
        description: "High intensity interval training",
        duration: 30,
        intensity: "High",
        imageUrl: "https://images.unsplash.com/photo-1536922246289-88c42f957773"
      },
      participants: [{ id: 1, name: "Sarah Taylor" }]
    },
    {
      id: 2,
      userId: 1,
      workoutId: 2,
      scheduledAt: new Date(Date.now() + 86400000 * 3),
      completed: false,
      workout: {
        id: 2,
        title: "Family Yoga",
        description: "Low intensity flexibility training",
        duration: 45,
        intensity: "Low",
        imageUrl: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776"
      },
      participants: [
        { id: 1, name: "Sarah Taylor" },
        { id: 2, name: "Mike Taylor" },
        { id: 3, name: "Amy Taylor" }
      ]
    },
    {
      id: 3,
      userId: 2,
      workoutId: 3,
      scheduledAt: new Date(Date.now() + 86400000 * 4),
      completed: false,
      workout: {
        id: 3,
        title: "Morning Run",
        description: "Medium intensity cardio",
        duration: 20,
        intensity: "Medium",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"
      },
      participants: [
        { id: 2, name: "Mike Taylor" },
        { id: 4, name: "Jake Taylor" }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Workouts</CardTitle>
          <Dialog open={isAddWorkoutOpen} onOpenChange={setIsAddWorkoutOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="mr-2 h-4 w-4" />
                Add Workout
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Workout</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. HIIT Training" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Describe the workout..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
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
                      name="intensity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intensity</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              {...field}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={addWorkoutMutation.isPending}>
                      {addWorkoutMutation.isPending ? "Scheduling..." : "Schedule Workout"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayWorkouts.map((userWorkout) => (
            <div key={userWorkout.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              <div className="aspect-video relative bg-gray-100 dark:bg-gray-700">
                <img
                  src={userWorkout.workout.imageUrl || getImageForIntensity(userWorkout.workout.intensity)}
                  alt={userWorkout.workout.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3 text-white">
                  <h3 className="font-bold">{userWorkout.workout.title}</h3>
                  <p className="text-sm">{userWorkout.workout.duration} minutes • {userWorkout.workout.intensity} intensity</p>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500 dark:text-gray-400"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                      <line x1="16" x2="16" y1="2" y2="6"></line>
                      <line x1="8" x2="8" y1="2" y2="6"></line>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(userWorkout.scheduledAt)}
                    </span>
                  </div>
                  <div className="flex items-center -space-x-2">
                    {userWorkout.participants?.map((participant, index) => (
                      <div
                        key={participant.id}
                        className="relative w-6 h-6 rounded-full overflow-hidden border border-white dark:border-gray-800"
                      >
                        <img
                          src={`https://images.unsplash.com/photo-${index === 0 ? "1494790108377-be9c29b29330" : index === 1 ? "1568602471122-7832951cc4c5" : "1463453091185-61582044d556"}`}
                          alt={participant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex justify-between">
                  <Button variant="ghost" size="sm" className="h-8">
                    <BarChart className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                  <Button size="sm" className="h-8">
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
