import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FamilyMember } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function FamilyProgress() {
  const { data, isLoading, error } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family/members'],
  });

  if (isLoading) {
    return <FamilyProgressSkeleton />;
  }

  if (error || !data) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Family Progress</h2>
          <Link href="/family-profiles" className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
            View all members
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          Failed to load family progress data. Please try again later.
        </div>
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Family Progress</h2>
          <Link href="/family-profiles" className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
            Add family members
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No family members found</p>
            <Link href="/family-profiles" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary-500 text-white hover:bg-primary-600 h-10 px-4 py-2">
              Add Family Members
            </Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Family Progress</h2>
        <Link href="/family-profiles" className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
          View all members
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative h-10 w-10">
                  {member.avatar ? (
                    <img
                      className="rounded-full object-cover"
                      src={member.avatar}
                      alt={`${member.name}'s profile picture`}
                    />
                  ) : (
                    <div className="rounded-full bg-primary-500/20 h-10 w-10 flex items-center justify-center text-primary-500">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${getStatusColor(member.status)} ring-1 ring-white`}></span>
                </div>
                <div>
                  <h3 className="font-medium">
                    {member.name}{" "}
                    {member.isCurrentUser && <span className="text-gray-500 dark:text-gray-400">(You)</span>}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Age {member.age}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Daily Goal</span>
                    <span className="font-medium">{member.dailyGoalPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-500 h-full rounded-full" 
                      style={{ width: `${member.dailyGoalPercent}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Streak</span>
                    <span className="font-medium">{member.streak} {member.streak === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(7)].map((_, index) => (
                      <div 
                        key={index}
                        className={`h-2 flex-1 rounded-full ${index < member.streak ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-orange-500';
    case 'offline':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
}

function FamilyProgressSkeleton() {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Family Progress</h2>
        <Skeleton className="h-5 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex gap-1">
                    {[...Array(7)].map((_, index) => (
                      <Skeleton key={index} className="h-2 flex-1 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
