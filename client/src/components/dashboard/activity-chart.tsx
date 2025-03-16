import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { ActivityData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityChart() {
  const { data, isLoading, error } = useQuery<ActivityData>({
    queryKey: ["/api/activity/weekly"],
  });

  if (isLoading) {
    return <ActivityChartSkeleton />;
  }

  if (error || !data) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Activity Trends</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your weekly activity metrics</p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
            Failed to load activity data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-lg font-semibold">Activity Trends</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your weekly activity metrics</p>
      </div>
      <CardContent className="p-6 pt-0">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.activities}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                padding={{ left: 10, right: 10 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false} 
                tickCount={5}
                domain={[0, 'dataMax + 1000']}
                hide
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="steps"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="hsl(24, 95%, 53%)"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center mt-4 gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Steps</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Calories</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityChartSkeleton() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-lg font-semibold">Activity Trends</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your weekly activity metrics</p>
      </div>
      <CardContent className="p-6 pt-0">
        <Skeleton className="h-[240px] w-full rounded-lg" />
        
        <div className="flex items-center justify-center mt-4 gap-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
