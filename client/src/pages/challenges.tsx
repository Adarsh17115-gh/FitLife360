import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopBar from "@/components/layout/top-bar";
import FamilyProfileSwitcher from "@/components/layout/family-profile-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import {
  Trophy,
  Users,
  Calendar,
  Target,
  Plus,
  Award,
  Star,
  Flame,
  MessageSquare,
  Mountain,
  Zap,
  Timer,
  ChevronRight,
  Heart
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

export default function Challenges() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewChallengeOpen, setIsNewChallengeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [challengeDetailsOpen, setChallengeDetailsOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get all challenges
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['/api/challenges'],
  });

  // Get user challenges
  const { data: userChallenges, isLoading: isLoadingUserChallenges } = useQuery({
    queryKey: ['/api/users/1/challenges'],
  });

  // Get family members
  const { data: familyMembers, isLoading: isLoadingFamilyMembers } = useQuery({
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

  const createChallengeMutation = useMutation({
    mutationFn: async (challenge: ChallengeFormValues) => {
      return await apiRequest("POST", "/api/challenges", {
        ...challenge,
        startDate: new Date(challenge.startDate),
        endDate: new Date(challenge.endDate),
        goalValue: Number(challenge.goalValue),
      });
    },
    onSuccess: async (response) => {
      const newChallenge = await response.json();
      
      // Join the challenge automatically
      await apiRequest("POST", "/api/user-challenges", {
        userId: 1,
        challengeId: newChallenge.id,
        progress: 0,
        completed: false,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/challenges'] });
      setIsNewChallengeOpen(false);
      form.reset();
      toast({
        title: "Challenge Created",
        description: "Your challenge has been created successfully",
      });
    },
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      return await apiRequest("POST", "/api/user-challenges", {
        userId: 1,
        challengeId,
        progress: 0,
        completed: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/challenges'] });
      setChallengeDetailsOpen(false);
      toast({
        title: "Challenge Joined",
        description: "You've successfully joined the challenge",
      });
    },
  });

  const onSubmit = (data: ChallengeFormValues) => {
    createChallengeMutation.mutate(data);
  };

  const getChallengeIcon = (goalType: string, title: string) => {
    if (title.toLowerCase().includes("hike") || title.toLowerCase().includes("walk")) {
      return <Mountain className="h-5 w-5 text-accent" />;
    }
    
    switch (goalType.toLowerCase()) {
      case "steps":
        return <Zap className="h-5 w-5 text-primary" />;
      case "activeminutes":
        return <Timer className="h-5 w-5 text-primary" />;
      case "calories":
        return <Flame className="h-5 w-5 text-primary" />;
      default:
        return <Trophy className="h-5 w-5 text-primary" />;
    }
  };

  const openChallengeDetails = (challenge: any) => {
    setSelectedChallenge(challenge);
    setChallengeDetailsOpen(true);
  };

  const isUserParticipating = (challengeId: number) => {
    return userChallenges?.some(uc => uc.challengeId === challengeId);
  };

  // Sample challenges if none are returned
  const displayChallenges = challenges?.length > 0 ? challenges : [
    {
      id: 1,
      title: "10K Steps Challenge",
      description: "Complete 10,000 steps each day for a week",
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      goalType: "steps",
      goalValue: 10000,
      participants: [
        { id: 1, name: "Sarah Taylor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
        { id: 2, name: "Mike Taylor", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5" },
        { id: 4, name: "Jake Taylor", avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556" }
      ],
      progress: 75,
      userProgress: 7500
    },
    {
      id: 2,
      title: "Weekend Hike",
      description: "Complete a family hike together",
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      goalType: "activity",
      goalValue: 1,
      participants: [
        { id: 1, name: "Sarah Taylor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
        { id: 2, name: "Mike Taylor", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5" },
        { id: 3, name: "Amy Taylor", avatar: "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e" },
        { id: 4, name: "Jake Taylor", avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556" }
      ],
      progress: 100,
      userProgress: 1
    },
    {
      id: 3,
      title: "30-Day Fitness Challenge",
      description: "Complete daily exercises for 30 days",
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      goalType: "activeMinutes",
      goalValue: 1800,
      participants: [
        { id: 1, name: "Sarah Taylor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
        { id: 3, name: "Amy Taylor", avatar: "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e" }
      ],
      progress: 50,
      userProgress: 900
    },
    {
      id: 4,
      title: "10,000 Calorie Burn",
      description: "Burn 10,000 calories this month",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      goalType: "calories",
      goalValue: 10000,
      participants: [
        { id: 2, name: "Mike Taylor", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5" },
        { id: 4, name: "Jake Taylor", avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556" }
      ],
      progress: 40,
      userProgress: 0
    }
  ];

  const activeChallenges = displayChallenges.filter(
    challenge => new Date(challenge.endDate) >= new Date()
  );
  
  const completedChallenges = displayChallenges.filter(
    challenge => new Date(challenge.endDate) < new Date()
  );
  
  const myChallenges = displayChallenges.filter(
    challenge => isUserParticipating(challenge.id)
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar - conditionally rendered */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
          <aside 
            className="fixed inset-y-0 left-0 w-64 bg-sidebar dark:bg-gray-800 text-sidebar-foreground overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64">
        <TopBar title="Challenges" toggleMobileMenu={toggleMobileMenu} />
        <FamilyProfileSwitcher />

        <div className="p-4 sm:p-6 space-y-6 pb-20 md:pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Family Challenges</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Create and join challenges to motivate your family
              </p>
            </div>
            <Dialog open={isNewChallengeOpen} onOpenChange={setIsNewChallengeOpen}>
              <DialogTrigger asChild>
                <Button>
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
                      <Button type="submit" disabled={createChallengeMutation.isPending}>
                        {createChallengeMutation.isPending ? "Creating..." : "Create Challenge"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {/* Challenge Details Dialog */}
            <Dialog open={challengeDetailsOpen} onOpenChange={setChallengeDetailsOpen}>
              <DialogContent className="sm:max-w-[600px]">
                {selectedChallenge && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-xl">{selectedChallenge.title}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedChallenge.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(selectedChallenge.startDate)} - {formatDate(selectedChallenge.endDate)}
                        </div>
                        <div className="flex items-center">
                          <Target className="mr-1 h-4 w-4" />
                          Goal: {selectedChallenge.goalValue} {selectedChallenge.goalType.toLowerCase() === "steps" 
                            ? "steps" 
                            : selectedChallenge.goalType.toLowerCase() === "activeminutes" 
                              ? "active minutes" 
                              : selectedChallenge.goalType.toLowerCase() === "calories" 
                                ? "calories" 
                                : "activities"}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {selectedChallenge.participants?.length || 0} participants
                        </div>
                      </div>
                      
                      <div className="rounded-md border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="font-medium mb-2">Progress</h3>
                        <Progress 
                          value={selectedChallenge.progress} 
                          className="h-2 mb-2" 
                        />
                        <div className="flex justify-between text-sm">
                          <span>{selectedChallenge.userProgress || 0} / {selectedChallenge.goalValue}</span>
                          <span>{selectedChallenge.progress}% complete</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Participants</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedChallenge.participants?.map((participant: any) => (
                            <div key={participant.id} className="flex items-center gap-2 p-2 rounded-md border border-gray-200 dark:border-gray-700">
                              <div className="w-8 h-8 rounded-full overflow-hidden">
                                <img 
                                  src={participant.avatar}
                                  alt={participant.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm font-medium">{participant.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                      </DialogClose>
                      {!isUserParticipating(selectedChallenge.id) && (
                        <Button 
                          onClick={() => joinChallengeMutation.mutate(selectedChallenge.id)}
                          disabled={joinChallengeMutation.isPending}
                        >
                          {joinChallengeMutation.isPending ? "Joining..." : "Join Challenge"}
                        </Button>
                      )}
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="my">My Challenges</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : activeChallenges.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeChallenges.map((challenge) => (
                    <Card key={challenge.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            {getChallengeIcon(challenge.goalType, challenge.title)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{challenge.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{challenge.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {formatRelativeTime(challenge.endDate)}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {challenge.participants?.length || 0} / {familyMembers?.length || 4}
                          </div>
                        </div>
                        
                        <Progress value={challenge.progress} className="h-2 mb-2" />
                        
                        <div className="flex flex-wrap -space-x-2 mt-3">
                          {challenge.participants?.slice(0, 4).map((participant: any, index: number) => (
                            <div
                              key={participant.id}
                              className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800"
                            >
                              <img
                                src={participant.avatar}
                                alt={participant.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {challenge.participants && challenge.participants.length > 4 && (
                            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 text-xs font-medium">
                              +{challenge.participants.length - 4}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => openChallengeDetails(challenge)}
                        >
                          View Challenge
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Challenges</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Create a new challenge to motivate your family
                  </p>
                  <Button onClick={() => setIsNewChallengeOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Challenge
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="my" className="mt-6">
              {isLoadingUserChallenges ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : myChallenges.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myChallenges.map((challenge) => (
                    <Card key={challenge.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            {getChallengeIcon(challenge.goalType, challenge.title)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{challenge.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{challenge.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {formatRelativeTime(challenge.endDate)}
                          </div>
                          <div className="flex items-center">
                            <Target className="mr-1 h-4 w-4" />
                            {challenge.userProgress || 0} / {challenge.goalValue}
                          </div>
                        </div>
                        
                        <Progress value={challenge.progress} className="h-2 mb-2" />
                        
                        <div className="flex flex-wrap -space-x-2 mt-3">
                          {challenge.participants?.slice(0, 4).map((participant: any) => (
                            <div
                              key={participant.id}
                              className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800"
                            >
                              <img
                                src={participant.avatar}
                                alt={participant.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {challenge.participants && challenge.participants.length > 4 && (
                            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 text-xs font-medium">
                              +{challenge.participants.length - 4}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => openChallengeDetails(challenge)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">You haven't joined any challenges</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Join an existing challenge or create a new one
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("active")}>
                      Browse Challenges
                    </Button>
                    <Button onClick={() => setIsNewChallengeOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Challenge
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-[200px] w-full" />
                  ))}
                </div>
              ) : completedChallenges.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {completedChallenges.map((challenge) => (
                    <Card key={challenge.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-2">
                          <div className="rounded-full bg-accent/10 p-2">
                            <Award className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{challenge.title}</CardTitle>
                            <CardDescription>Completed on {formatDate(challenge.endDate)}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {challenge.participants?.length || 0} participants
                          </div>
                          <div className="flex items-center">
                            <Target className="mr-1 h-4 w-4" />
                            {challenge.goalValue} {challenge.goalType.toLowerCase() === "steps" 
                              ? "steps" 
                              : challenge.goalType.toLowerCase() === "activeminutes" 
                                ? "active minutes" 
                                : challenge.goalType.toLowerCase() === "calories" 
                                  ? "calories" 
                                  : "activities"}
                          </div>
                        </div>
                        
                        <Progress value={challenge.progress} className="h-2 mb-2" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="h-5 w-5 text-yellow-500 mr-1" />
                            <span className="font-medium">
                              {challenge.progress === 100 ? "Completed!" : "Incomplete"}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary"
                            onClick={() => openChallengeDetails(challenge)}
                          >
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Award className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Completed Challenges</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Complete challenges to see them here
                  </p>
                  <Button onClick={() => setActiveTab("active")}>Browse Active Challenges</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Challenge Achievements</CardTitle>
              <CardDescription>
                Track your progress and earn badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium text-center">Challenge Champion</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    Complete 5 challenges
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium text-center">Step Master</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    Reach 100,000 steps
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-accent/10 mb-2">
                    <Mountain className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-medium text-center">Weekend Warrior</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    Complete weekend challenge
                  </p>
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded mt-2">Earned!</span>
                </div>
                
                <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium text-center">Family Bond</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    Complete family challenge
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
