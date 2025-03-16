import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import TopBar from "@/components/layout/top-bar";
import FamilyProfileSwitcher from "@/components/layout/family-profile-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Filter,
  Flame,
  Play,
  Plus,
  Search,
  TagIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAIWorkoutRecommendations } from "@/lib/ai";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Workouts() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [aiWorkout, setAiWorkout] = useState<any>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get all workouts
  const { data: workouts, isLoading } = useQuery({
    queryKey: ['/api/workouts'],
  });

  // Get user workouts
  const { data: userWorkouts, isLoading: isLoadingUserWorkouts } = useQuery({
    queryKey: ['/api/users/1/workouts'],
  });

  const getAIRecommendation = async () => {
    setIsGeneratingWorkout(true);
    try {
      const recommendation = await getAIWorkoutRecommendations(1, {
        fitnessLevel: "Intermediate",
        goals: "Weight loss, strength",
        duration: 30,
        equipment: "Minimal home equipment"
      });
      
      setAiWorkout(recommendation);
    } catch (error) {
      console.error("Error getting workout recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to get workout recommendation",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  // Filter workouts based on search query and active tab
  const filteredWorkouts = workouts?.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "my-workouts") {
      return matchesSearch && userWorkouts?.some(uw => uw.workoutId === workout.id);
    }
    return matchesSearch && workout.intensity.toLowerCase() === activeTab;
  }) || [];

  // Sample workouts if none are returned
  const displayWorkouts = filteredWorkouts.length > 0 ? filteredWorkouts : [
    {
      id: 1,
      title: "HIIT Training",
      description: "High intensity interval training",
      duration: 30,
      intensity: "High",
      imageUrl: "https://images.unsplash.com/photo-1536922246289-88c42f957773",
    },
    {
      id: 2,
      title: "Morning Yoga",
      description: "Start your day with energizing yoga",
      duration: 20,
      intensity: "Low",
      imageUrl: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776",
    },
    {
      id: 3,
      title: "Strength Training",
      description: "Build muscle with these strength exercises",
      duration: 45,
      intensity: "Medium",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    },
    {
      id: 4,
      title: "Cardio Kickboxing",
      description: "Burn calories with these kickboxing moves",
      duration: 40,
      intensity: "High",
      imageUrl: "https://images.unsplash.com/photo-1540496905036-5937c10647cc",
    },
    {
      id: 5,
      title: "Pilates",
      description: "Core-strengthening workout",
      duration: 25,
      intensity: "Low",
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a",
    },
    {
      id: 6,
      title: "Running",
      description: "Indoor or outdoor running workout",
      duration: 30,
      intensity: "Medium",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar - conditionally rendered */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
          <aside 
            className="fixed inset-y-0 left-0 w-64 z-50 bg-sidebar dark:bg-gray-800 text-sidebar-foreground overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64">
        <TopBar title="Workouts" toggleMobileMenu={toggleMobileMenu} />
        <FamilyProfileSwitcher />

        <div className="p-4 sm:p-6 space-y-6 pb-20 md:pb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Search workouts..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={getAIRecommendation} disabled={isGeneratingWorkout}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isGeneratingWorkout ? "Generating..." : "AI Recommendation"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>AI Workout Recommendation</DialogTitle>
                  </DialogHeader>
                  {aiWorkout ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold">{aiWorkout.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{aiWorkout.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {aiWorkout.duration} minutes
                          </div>
                          <div className="flex items-center">
                            <Flame className="mr-1 h-4 w-4" />
                            {aiWorkout.intensity} intensity
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Exercises:</h4>
                        <div className="space-y-2">
                          {aiWorkout.exercises.map((exercise: any, index: number) => (
                            <div key={index} className="rounded-md border border-gray-200 dark:border-gray-700 p-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium">{exercise.name}</h5>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {exercise.sets} sets × {exercise.reps} reps
                                </span>
                              </div>
                              {exercise.rest && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Rest: {exercise.rest} seconds
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button>Save Workout</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6">
                      <Skeleton className="h-[200px] w-full" />
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="low">Low Intensity</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="high">High Intensity</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-[300px] w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {displayWorkouts.map((workout) => (
                    <Card key={workout.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={workout.imageUrl}
                          alt={workout.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-3 text-white">
                          <h3 className="font-bold">{workout.title}</h3>
                          <p className="text-sm">{workout.duration} minutes • {workout.intensity} intensity</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <Clock className="mr-1 h-3 w-3" />
                            {workout.duration} min
                          </div>
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <Flame className="mr-1 h-3 w-3" />
                            {workout.intensity}
                          </div>
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <TagIcon className="mr-1 h-3 w-3" />
                            {workout.title.includes("Yoga") ? "Flexibility" : workout.title.includes("HIIT") ? "Cardio" : "Strength"}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {workout.description}
                        </p>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </Button>
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="low" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayWorkouts
                  .filter((workout) => workout.intensity.toLowerCase() === "low")
                  .map((workout) => (
                    // Same card component as above, repeated for each intensity tab
                    <Card key={workout.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={workout.imageUrl}
                          alt={workout.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-3 text-white">
                          <h3 className="font-bold">{workout.title}</h3>
                          <p className="text-sm">{workout.duration} minutes • {workout.intensity} intensity</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <Clock className="mr-1 h-3 w-3" />
                            {workout.duration} min
                          </div>
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <Flame className="mr-1 h-3 w-3" />
                            {workout.intensity}
                          </div>
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <TagIcon className="mr-1 h-3 w-3" />
                            {workout.title.includes("Yoga") ? "Flexibility" : workout.title.includes("HIIT") ? "Cardio" : "Strength"}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {workout.description}
                        </p>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </Button>
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="medium" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayWorkouts
                  .filter((workout) => workout.intensity.toLowerCase() === "medium")
                  .map((workout) => (
                    // Same card component as above
                    <Card key={workout.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={workout.imageUrl}
                          alt={workout.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-3 text-white">
                          <h3 className="font-bold">{workout.title}</h3>
                          <p className="text-sm">{workout.duration} minutes • {workout.intensity} intensity</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <Clock className="mr-1 h-3 w-3" />
                            {workout.duration} min
                          </div>
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <Flame className="mr-1 h-3 w-3" />
                            {workout.intensity}
                          </div>
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <TagIcon className="mr-1 h-3 w-3" />
                            {workout.title.includes("Yoga") ? "Flexibility" : workout.title.includes("HIIT") ? "Cardio" : "Strength"}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {workout.description}
                        </p>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </Button>
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="high" className="mt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayWorkouts
                  .filter((workout) => workout.intensity.toLowerCase() === "high")
                  .map((workout) => (
                    // Same card component as above
                    <Card key={workout.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={workout.imageUrl}
                          alt={workout.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-3 text-white">
                          <h3 className="font-bold">{workout.title}</h3>
                          <p className="text-sm">{workout.duration} minutes • {workout.intensity} intensity</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <Clock className="mr-1 h-3 w-3" />
                            {workout.duration} min
                          </div>
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <Flame className="mr-1 h-3 w-3" />
                            {workout.intensity}
                          </div>
                          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300">
                            <TagIcon className="mr-1 h-3 w-3" />
                            {workout.title.includes("Yoga") ? "Flexibility" : workout.title.includes("HIIT") ? "Cardio" : "Strength"}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {workout.description}
                        </p>
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule
                          </Button>
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
