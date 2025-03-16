import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getAiWorkoutRecommendations } from "@/lib/openai";
import { AiWorkoutRecommendation } from "@/lib/openai";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkoutRecommendations() {
  const { data, isLoading, error } = useQuery<AiWorkoutRecommendation>({
    queryKey: ['/api/ai/workout'],
    queryFn: getAiWorkoutRecommendations,
  });

  if (isLoading) {
    return <WorkoutRecommendationsSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <div className="flex justify-between items-center p-6">
          <div>
            <h3 className="text-lg font-semibold">AI Workout Recommendations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Based on your fitness goals</p>
          </div>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-primary-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
        </div>
        <CardContent className="p-6 pt-0">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
            Failed to load AI workout recommendations. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center p-6">
        <div>
          <h3 className="text-lg font-semibold">AI Workout Recommendations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Based on your fitness goals</p>
        </div>
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-primary-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
          </svg>
        </div>
      </div>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Training Insight</h4>
            </div>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{data.insight}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Recommended Workouts</h4>
          
          {data.workouts.map((workout, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="h-12 w-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <img 
                  src={workout.image}
                  alt={workout.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-sm">{workout.name}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 rounded-full">{workout.duration} min</span>
                  <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300 rounded-full">{workout.calories} cal</span>
                </div>
              </div>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        <Button asChild className="w-full">
          <Link href="/ai-coach">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            Chat with AI Coach
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function WorkoutRecommendationsSkeleton() {
  return (
    <Card>
      <div className="flex justify-between items-center p-6">
        <div>
          <h3 className="text-lg font-semibold">AI Workout Recommendations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Based on your fitness goals</p>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 mb-2" />
          
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
        
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
