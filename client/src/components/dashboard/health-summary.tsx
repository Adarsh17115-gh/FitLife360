import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumberWithCommas, calculateProgress } from "@/lib/utils";
import { ActivitySquare, Clock, Flame, StepForward } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { format } from "date-fns";

interface HealthMetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  target: number;
  unit?: string;
  progress: number;
}

const HealthMetricCard = ({ icon, title, value, target, unit, progress }: HealthMetricCardProps) => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
    <div className="flex items-center">
      <div className="text-primary">{icon}</div>
      <h3 className="ml-2 text-base font-semibold">{title}</h3>
    </div>
    <div className="mt-4">
      <div className="flex items-baseline">
        <span className="text-3xl font-bold">{value}</span>
        {target && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">/ {target}{unit}</span>}
        {!target && unit && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
        <div 
          className="h-2 rounded-full bg-primary" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  </div>
);

export default function HealthSummary() {
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const { data: healthMetrics, isLoading } = useQuery({
    queryKey: ['/api/users/1/health-metrics'],
  });

  // Use sample data while loading
  const metrics = isLoading ? {
    steps: 7342,
    activeMinutes: 42,
    caloriesBurned: 1875,
    sleep: 450 // in minutes
  } : healthMetrics;

  const sleepHours = metrics?.sleep ? metrics.sleep / 60 : 0;
  
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <CardTitle className="text-xl">Health Summary</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{format(date, 'MMM d, yyyy')}</span>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar size={16} />
                Change Date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                    setCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HealthMetricCard
          icon={<StepForward size={24} />}
          title="Steps"
          value={formatNumberWithCommas(metrics?.steps || 0)}
          target={10000}
          progress={calculateProgress(metrics?.steps || 0, 10000)}
        />
        
        <HealthMetricCard
          icon={<Clock size={24} />}
          title="Active Minutes"
          value={metrics?.activeMinutes || 0}
          target={60}
          progress={calculateProgress(metrics?.activeMinutes || 0, 60)}
        />
        
        <HealthMetricCard
          icon={<Flame size={24} />}
          title="Calories"
          value={formatNumberWithCommas(metrics?.caloriesBurned || 0)}
          target={0}
          unit="kcal"
          progress={85} // Hard-coded for now
        />
        
        <HealthMetricCard
          icon={<ActivitySquare size={24} />}
          title="Sleep"
          value={sleepHours.toFixed(1)}
          target={0}
          unit="hrs"
          progress={94} // Hard-coded for now
        />
      </div>
    </section>
  );
}
