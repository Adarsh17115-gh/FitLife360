import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Challenge } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Users, Clock, Calendar, Star, Plus, Filter, Award } from "lucide-react";

export default function Challenges() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const { data: challenges, isLoading, error } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges'],
  });

  const openChallengeDialog = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsDialogOpen(true);
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <>
      {/* Page Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold">Challenges</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Compete and stay motivated with friends and family</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Challenge
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Challenges</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          {/* Active Challenges Tab */}
          <TabsContent value="active" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-2 w-full rounded-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                Failed to load challenges. Please try again later.
              </div>
            ) : challenges && challenges.filter(c => c.status === 'active').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.filter(c => c.status === 'active').map((challenge) => (
                  <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{challenge.name}</CardTitle>
                          <CardDescription>{challenge.type}</CardDescription>
                        </div>
                        {challenge.type === 'steps' && <Users className="h-5 w-5 text-primary-500" />}
                        {challenge.type === 'workout' && <Trophy className="h-5 w-5 text-amber-500" />}
                        {challenge.type === 'nutrition' && <Award className="h-5 w-5 text-emerald-500" />}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {challenge.description}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{challenge.progress}%</span>
                        </div>
                        <Progress 
                          value={challenge.progress}
                          className="h-2"
                          indicatorClassName={getProgressColor(challenge.progress)}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{challenge.timeLeft}</span>
                        </div>
                        <div className="flex items-center -space-x-2">
                          {challenge.participants.slice(0, 3).map((participant, index) => (
                            <div 
                              key={index}
                              className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium"
                            >
                              {participant.avatar ? (
                                <img 
                                  src={participant.avatar} 
                                  alt={participant.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span>{participant.name.charAt(0)}</span>
                              )}
                            </div>
                          ))}
                          {challenge.participants.length > 3 && (
                            <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium">
                              +{challenge.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => openChallengeDialog(challenge)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">No active challenges</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Join or create a challenge to compete with friends and family.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Challenge
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Upcoming Challenges Tab */}
          <TabsContent value="upcoming">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">No upcoming challenges</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Schedule a challenge for the future to keep your fitness journey exciting.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Challenge
              </Button>
            </div>
          </TabsContent>

          {/* Completed Challenges Tab */}
          <TabsContent value="completed">
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">No completed challenges yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Complete challenges to see your achievements here.
              </p>
              <Button variant="outline">
                Browse Active Challenges
              </Button>
            </div>
          </TabsContent>

          {/* Discover Challenges Tab */}
          <TabsContent value="discover">
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">Discover new challenges</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Find and join challenges created by others in the FitLife360 community.
              </p>
              <Button variant="outline">
                Browse Community Challenges
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Challenge Details Dialog */}
        {selectedChallenge && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedChallenge.name}</DialogTitle>
                <DialogDescription>{selectedChallenge.type} challenge</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm">{selectedChallenge.description}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{selectedChallenge.timeLeft} left</span>
                    </div>
                    <div className="font-medium">
                      {selectedChallenge.goal} {selectedChallenge.unit}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Progress</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{selectedChallenge.current} of {selectedChallenge.goal} {selectedChallenge.unit}</span>
                      <span className="font-medium">{selectedChallenge.progress}%</span>
                    </div>
                    <Progress 
                      value={selectedChallenge.progress}
                      className="h-2"
                      indicatorClassName={getProgressColor(selectedChallenge.progress)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Participants</h3>
                  <div className="space-y-2">
                    {selectedChallenge.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                            {participant.avatar ? (
                              <img 
                                src={participant.avatar} 
                                alt={participant.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{participant.name.charAt(0)}</span>
                            )}
                          </div>
                          <span>{participant.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{participant.progress}%</span>
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={getProgressColor(participant.progress)} 
                              style={{ width: `${participant.progress}%`, height: '100%' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button variant="outline" className="flex-1">Invite Friends</Button>
                <Button className="flex-1">Update Progress</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
