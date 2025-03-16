import { useState } from 'react';
import { useHealthMetrics } from '@/hooks/use-health-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ActivityChartProps {
  userId: number;
  className?: string;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ActivityChart({ userId, className = '' }: ActivityChartProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const { data: healthMetrics, isLoading } = useHealthMetrics(userId);

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
          <Tabs defaultValue="week" className="h-9">
            <TabsList className="grid grid-cols-3 w-[200px]">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between animate-pulse">
            {days.map((day, i) => (
              <div key={i} className="flex flex-col items-center w-1/7">
                <div className="bg-gray-200 dark:bg-gray-700 w-10 rounded-t-md" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">{day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthMetrics || healthMetrics.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
          <Tabs defaultValue="week" className="h-9">
            <TabsList className="grid grid-cols-3 w-[200px]">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No activity data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the current day index (0-6, where 0 is Monday)
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 6 : today - 1; // Adjust to make Monday index 0

  // For demo purposes, generate daily activity data
  const activityData = days.map((day, index) => {
    // If we have data for this day, use it, otherwise generate a placeholder
    const dayMetric = healthMetrics.find((metric, i) => i === index);
    const isActive = index === currentDayIndex;
    
    let height = 30; // Default height percentage
    if (dayMetric) {
      // Normalize the steps to a percentage (assuming 10,000 steps is 100%)
      height = Math.min(Math.round((dayMetric.steps / 10000) * 100), 100);
    } else {
      // Generate random data for missing days
      height = Math.floor(Math.random() * 70) + 30;
    }
    
    return {
      day,
      height: `${height}%`,
      isActive
    };
  });

  // Calculate totals for the summary
  const totalSteps = healthMetrics.reduce((sum, metric) => sum + metric.steps, 0);
  const avgActiveTime = Math.round(healthMetrics.reduce((sum, metric) => sum + metric.activeMinutes, 0) / healthMetrics.length);
  const totalCalories = healthMetrics.reduce((sum, metric) => sum + metric.caloriesBurned, 0);

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
        <Tabs 
          defaultValue="week" 
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as 'week' | 'month' | 'year')}
          className="h-9"
        >
          <TabsList className="grid grid-cols-3 w-[200px]">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between">
          {activityData.map((data, index) => (
            <div key={index} className="flex flex-col items-center w-1/7">
              <div 
                className={`chart-bar ${
                  data.isActive 
                    ? 'bg-primary-500' 
                    : 'bg-primary-200 dark:bg-primary-900/40'
                } w-10 rounded-t-md`} 
                style={{ height: data.height }}
              ></div>
              <span className={`mt-2 text-xs ${
                data.isActive 
                  ? 'font-medium' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>{data.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Steps</p>
            <p className="text-lg font-semibold mt-1">{totalSteps.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Active Time</p>
            <p className="text-lg font-semibold mt-1">{avgActiveTime} min/day</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Calories Burned</p>
            <p className="text-lg font-semibold mt-1">{totalCalories.toLocaleString()} kcal</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
