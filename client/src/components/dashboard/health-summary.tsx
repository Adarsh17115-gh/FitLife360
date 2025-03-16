import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { HealthData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function HealthSummary() {
  const { data, isLoading, error } = useQuery<HealthData>({
    queryKey: ["/api/health/summary"],
  });

  if (isLoading) {
    return <HealthSummarySkeleton />;
  }

  if (error || !data) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Health Summary</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          Failed to load health summary data. Please try again later.
        </div>
      </div>
    );
  }

  const { heartRate, steps, sleep, calories } = data;
  
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Your Health Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5 mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Heart Rate</h3>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="text-red-500 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{heartRate.current}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">BPM</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-red-500 h-full rounded-full" 
                style={{ 
                  width: `${Math.min(100, (heartRate.current / heartRate.max) * 100)}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Resting range: {heartRate.min}-{heartRate.max} BPM
            </p>
          </CardContent>
        </Card>

        {/* Steps Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5 mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Daily Steps</h3>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="text-primary-500 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{steps.current.toLocaleString()}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">steps</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-primary-500 h-full rounded-full" 
                style={{ width: `${steps.percentComplete}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              {steps.percentComplete}% of daily goal ({steps.goal.toLocaleString()})
            </p>
          </CardContent>
        </Card>

        {/* Sleep Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5 mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Sleep</h3>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="text-indigo-500 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{sleep.current}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">hours</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full" 
                style={{ width: `${sleep.percentComplete}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              {sleep.percentComplete}% of target ({sleep.goal} hours)
            </p>
          </CardContent>
        </Card>

        {/* Calories Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1.5 mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Calories</h3>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="text-orange-500 w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{calories.current.toLocaleString()}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">kcal</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-orange-500 h-full rounded-full" 
                style={{ width: `${calories.percentComplete}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              {calories.percentComplete}% of daily goal ({calories.goal.toLocaleString()})
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function HealthSummarySkeleton() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Your Health Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-9 w-16 mb-2" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
