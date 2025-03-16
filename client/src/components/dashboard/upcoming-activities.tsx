import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { UpcomingActivity } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingActivities() {
  const { data, isLoading, error } = useQuery<UpcomingActivity[]>({
    queryKey: ["/api/activities/upcoming"],
  });

  if (isLoading) {
    return <UpcomingActivitiesSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Upcoming Activities</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Scheduled workouts & challenges</p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
            Failed to load upcoming activities. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Upcoming Activities</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Scheduled workouts & challenges</p>
          <div className="text-center p-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No upcoming activities found</p>
            <Link href="/workouts" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Plan a new workout
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-lg font-semibold">Upcoming Activities</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled workouts & challenges</p>
      </div>
      <CardContent className="p-6 pt-0 space-y-4">
        {data.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className={`h-10 w-10 flex items-center justify-center rounded-full ${getActivityIconBg(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{activity.title}</h4>
                <span className={`text-xs ${getActivityBadgeClass(activity.type)}`}>
                  {activity.status}
                </span>
              </div>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                {activity.description}
              </p>
              {activity.progress && (
                <>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`${getActivityProgressColor(activity.type)} h-full rounded-full`}
                      style={{ width: `${activity.progress.percent}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        
        <Link href="/workouts" className="inline-flex items-center justify-center mt-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
          View all activities
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </CardContent>
    </Card>
  );
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'workout':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
        </svg>
      );
    case 'challenge':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
        </svg>
      );
    case 'nutrition':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1 .53 0L12.53 3.38a.375.375 0 0 1-.53 0l-.265-.27Zm0 3.672a.375.375 0 1 1 .53 0l.265.27a.375.375 0 0 1-.53 0l-.265-.27Zm1.881-1.883a.375.375 0 1 1 0 .53l-.27.265a.375.375 0 0 1-.53 0l.27-.265a.375.375 0 0 1 .53 0Zm-3.762 0a.375.375 0 1 1 0 .53l.27.265a.375.375 0 0 1-.53 0l-.27-.265a.375.375 0 0 1 .53 0Zm2.599-1.19.71-.704a.375.375 0 1 1 .53.53l-.704.71a.375.375 0 0 1-.53-.53Zm-2.306.659a.375.375 0 1 1 .53.53l-.71.704a.375.375 0 0 1-.53-.53l.71-.704Z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      );
  }
}

function getActivityIconBg(type: string) {
  switch (type) {
    case 'workout':
      return 'bg-primary-100 dark:bg-primary-900 text-primary-500';
    case 'challenge':
      return 'bg-orange-100 dark:bg-orange-900 text-orange-500';
    case 'nutrition':
      return 'bg-green-100 dark:bg-green-900 text-green-500';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
  }
}

function getActivityBadgeClass(type: string) {
  switch (type) {
    case 'workout':
      return 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full';
    case 'challenge':
      return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full';
    case 'nutrition':
      return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full';
  }
}

function getActivityProgressColor(type: string) {
  switch (type) {
    case 'workout':
      return 'bg-primary-500';
    case 'challenge':
      return 'bg-orange-500';
    case 'nutrition':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

function UpcomingActivitiesSkeleton() {
  return (
    <Card>
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-lg font-semibold">Upcoming Activities</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled workouts & challenges</p>
      </div>
      <CardContent className="p-6 pt-0 space-y-4">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-2 w-full mt-2 rounded-full" />
            </div>
          </div>
        ))}
        
        <Skeleton className="h-5 w-32 mt-4" />
      </CardContent>
    </Card>
  );
}
