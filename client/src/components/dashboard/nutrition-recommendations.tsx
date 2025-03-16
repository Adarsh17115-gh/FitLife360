import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { getAiNutritionRecommendations } from "@/lib/openai";
import { AiNutritionRecommendation } from "@/lib/openai";
import { Skeleton } from "@/components/ui/skeleton";

export default function NutritionRecommendations() {
  const { data, isLoading, error } = useQuery<AiNutritionRecommendation>({
    queryKey: ['/api/ai/nutrition'],
    queryFn: getAiNutritionRecommendations,
  });

  if (isLoading) {
    return <NutritionRecommendationsSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <div className="flex justify-between items-center p-6">
          <div>
            <h3 className="text-lg font-semibold">AI Nutrition Recommendations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Personalized meal suggestions</p>
          </div>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-primary-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
        </div>
        <CardContent className="p-6 pt-0">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
            Failed to load AI nutrition recommendations. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between items-center p-6">
        <div>
          <h3 className="text-lg font-semibold">AI Nutrition Recommendations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Personalized meal suggestions</p>
        </div>
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-primary-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
          </svg>
        </div>
      </div>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/50 p-3 rounded-lg">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Macronutrient Balance</h4>
            </div>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{data.insight}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Today's Suggestions</h4>
          
          {data.suggestions.map((meal, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="h-12 w-12 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <img 
                  src={meal.image} 
                  alt={meal.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-sm">{meal.name}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full">{meal.protein}g protein</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full">{meal.calories} cal</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Link href="/nutrition" className="inline-flex items-center justify-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
          View all recommendations
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </CardContent>
    </Card>
  );
}

function NutritionRecommendationsSkeleton() {
  return (
    <Card>
      <div className="flex justify-between items-center p-6">
        <div>
          <h3 className="text-lg font-semibold">AI Nutrition Recommendations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Personalized meal suggestions</p>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-5 w-32 mb-2" />
          
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
            </div>
          ))}
        </div>
        
        <Skeleton className="h-5 w-48" />
      </CardContent>
    </Card>
  );
}
