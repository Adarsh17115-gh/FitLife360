import { useHealthMetrics } from '@/hooks/use-health-data';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Users, 
  Moon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface HealthSummaryProps {
  userId: number;
  className?: string;
}

export function HealthSummary({ userId, className = '' }: HealthSummaryProps) {
  const { data: healthMetrics, isLoading } = useHealthMetrics(userId);
  
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
        {Array(4).fill(0).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-xs mb-1">
                  <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-2 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!healthMetrics || healthMetrics.length === 0) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No health metrics available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the most recent metric
  const latestMetric = healthMetrics[0];

  const metrics = [
    {
      name: 'Daily Steps',
      value: latestMetric.steps.toLocaleString(),
      change: { value: 12, positive: true },
      icon: Activity,
      iconBg: 'bg-primary-50 dark:bg-primary-900/20',
      iconColor: 'text-primary-500',
      goal: 10000,
      current: latestMetric.steps,
      progressColor: 'bg-primary-500'
    },
    {
      name: 'Active Minutes',
      value: `${latestMetric.activeMinutes} min`,
      change: { value: 5, positive: false },
      icon: Clock,
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-500',
      goal: 60,
      current: latestMetric.activeMinutes,
      progressColor: 'bg-orange-500'
    },
    {
      name: 'Calories',
      value: `${latestMetric.caloriesBurned.toLocaleString()} kcal`,
      change: { value: 8, positive: true },
      icon: Users,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-500',
      goal: 2200,
      current: latestMetric.caloriesBurned,
      progressColor: 'bg-blue-500'
    },
    {
      name: 'Sleep',
      value: `${latestMetric.sleepHours}h ${Math.floor((latestMetric.sleepHours % 1) * 60)}m`,
      change: { value: 3, positive: true },
      icon: Moon,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-500',
      goal: 8,
      current: latestMetric.sleepHours,
      progressColor: 'bg-purple-500'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${className}`}>
      {metrics.map((metric) => (
        <Card key={metric.name} className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{metric.name}</p>
                <h3 className="text-2xl font-bold mt-1">{metric.value}</h3>
                <div className="flex items-center mt-1 text-sm">
                  <span className={`${metric.change.positive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    {metric.change.positive ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {metric.change.value}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">vs yesterday</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full ${metric.iconBg} flex items-center justify-center`}>
                <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Goal: {metric.name === 'Sleep' ? `${metric.goal} hours` : metric.goal.toLocaleString()}
                </span>
                <span className="font-medium">{Math.round((metric.current / metric.goal) * 100)}%</span>
              </div>
              <Progress 
                className="h-2 mt-1" 
                value={(metric.current / metric.goal) * 100} 
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
