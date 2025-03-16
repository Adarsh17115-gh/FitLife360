import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatRelativeTime } from "@/lib/utils";
import { DialogTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Zap, Mountain, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

const challengeFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters" }),
  startDate: z.string(),
  endDate: z.string(),
  goalType: z.string(),
  goalValue: z.number().min(1, { message: "Goal value must be at least 1" }),
});

type ChallengeFormValues = z.infer<typeof challengeFormSchema>;

export default function FamilyChallenges() {
  const [isNewChallengeOpen, setIsNewChallengeOpen] = useState(false);
  
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['/api/challenges', { active: true }],
  });

  const { data: familyMembers } = useQuery({
    queryKey: ['/api/families/1/users'],
  });

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      goalType: "steps",
      goalValue: 10000,
    },
  });

  const onSubmit = async (data: ChallengeFormValues) => {
    try {
      await apiRequest("POST", "/api/challenges", {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        goalValue: Number(data.goalValue),
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      setIsNewChallengeOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Family Challenges</CardTitle>
            <Button size="sm" className="h-8">
              <Plus className="mr-2 h-4 w-4" />
              New Challenge
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-[130px] w-full" />
            <Skeleton className="h-[130px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sample participants data
  const sampleParticipants = [
    { id: 1, name: "Sarah Taylor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
    { id: 2, name: "Mike Taylor", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5" },
    { id: 3, name: "Amy Taylor", avatar: "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e" },
    { id: 4, name: "Jake Taylor", avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556" }
  ];

  // Use sample data if no challenges are returned
  const displayChallenges = challenges?.length > 0 ? 
    // If we have real challenges, ensure they have a participants property
    challenges.map(challenge => ({
      ...challenge,
      participants: challenge.participants || sampleParticipants.slice(0, 3),
      progress: challenge.progress || 75
    })) : 
    // Otherwise use sample data
    [
      {
        id: 1,
        title: "10K Steps Challenge",
        description: "Complete 10,000 steps each day for a week",
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        goalType: "steps",
        goalValue: 10000,
        participants: sampleParticipants.slice(0, 3),
        progress: 75
      },
      {
        id: 2,
        title: "Weekend Hike",
        description: "Complete a family hike together",
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        goalType: "activity",
        goalValue: 1,
        participants: sampleParticipants,
        progress: 100
      }
    ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Family Challenges</CardTitle>
          <Dialog open={isNewChallengeOpen} onOpenChange={setIsNewChallengeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="mr-2 h-4 w-4" />
                New Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Challenge</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Challenge Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 10K Steps Challenge" />
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
                          <Textarea {...field} placeholder="Describe the challenge..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="goalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Type</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                              {...field}
                            >
                              <option value="steps">Steps</option>
                              <option value="activeMinutes">Active Minutes</option>
                              <option value="calories">Calories</option>
                              <option value="activity">Activity</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="goalValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Value</FormLabel>
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
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Challenge</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayChallenges.map((challenge) => (
            <div key={challenge.id} className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    {challenge.title.includes("Hike") ? (
                      <Mountain className="h-4 w-4 text-accent" />
                    ) : (
                      <Zap className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{challenge.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(challenge.endDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {challenge.participants?.length || 0}/
                    {familyMembers?.length || 4} members
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center text-xs">
                  <div className="relative h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className={`absolute inset-0 rounded-full ${
                        challenge.progress === 100 ? "bg-accent" : "bg-primary"
                      }`}
                      style={{ width: `${challenge.progress}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 font-medium">{challenge.progress}%</span>
                </div>
              </div>
              <div className="mt-3 flex -space-x-2">
                {challenge.participants?.map((participant) => (
                  <div
                    key={participant.id}
                    className="relative w-6 h-6 rounded-full overflow-hidden border border-white dark:border-gray-800"
                  >
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
