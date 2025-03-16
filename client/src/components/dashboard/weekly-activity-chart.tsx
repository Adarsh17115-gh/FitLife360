import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWeekDates, getDayName } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type MetricType = "steps" | "calories" | "activeMinutes" | "sleep";

export default function WeeklyActivityChart() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("steps");

  // Get dates for the current week
  const weekDates = getWeekDates();
  
  // Fetch weekly data
  const { data: weeklyData, isLoading } = useQuery({
    queryKey: ['/api/users/1/health-metrics'],
  });

  // Mock data for demonstration - in a real app this would come from the API
  const mockData = [
    { day: "Mon", steps: 6000, calories: 1500, activeMinutes: 30, sleep: 420 },
    { day: "Tue", steps: 8000, calories: 1800, activeMinutes: 45, sleep: 450 },
    { day: "Wed", steps: 4500, calories: 1300, activeMinutes: 25, sleep: 390 },
    { day: "Thu", steps: 7000, calories: 1650, activeMinutes: 40, sleep: 460 },
    { day: "Fri", steps: 6500, calories: 1550, activeMinutes: 35, sleep: 430 },
    { day: "Sat", steps: 9000, calories: 2000, activeMinutes: 60, sleep: 480 },
    { day: "Sun", steps: 3000, calories: 1200, activeMinutes: 20, sleep: 390 },
  ];

  // Combine real dates with mock data
  const chartData = weekDates.map((date, index) => ({
    day: getDayName(date, true),
    date: date,
    ...mockData[index],
  }));

  const getYAxisDomain = () => {
    switch (selectedMetric) {
      case "steps":
        return [0, 15000];
      case "calories":
        return [0, 2500];
      case "activeMinutes":
        return [0, 90];
      case "sleep":
        return [0, 600]; // in minutes
      default:
        return [0, 100];
    }
  };

  const getBarColor = (entry: any) => {
    // Highlight Saturday as it's in the design
    return entry.day === "Sat" ? "#10B981" : "#0EA5E9";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Activity</CardTitle>
          <Select 
            value={selectedMetric} 
            onValueChange={(value) => setSelectedMetric(value as MetricType)}
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steps">Steps</SelectItem>
              <SelectItem value="calories">Calories</SelectItem>
              <SelectItem value="activeMinutes">Active Minutes</SelectItem>
              <SelectItem value="sleep">Sleep</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 20,
            }}
          >
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={getYAxisDomain()}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => selectedMetric === "sleep" ? (value / 60).toFixed(1) : value.toString()}
            />
            <Tooltip
              formatter={(value) => {
                if (selectedMetric === "sleep") {
                  const hours = Math.floor(Number(value) / 60);
                  const minutes = Number(value) % 60;
                  return [`${hours}h ${minutes}m`, "Sleep"];
                }
                return [value, selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)];
              }}
            />
            <Bar 
              dataKey={selectedMetric} 
              radius={[4, 4, 0, 0]} 
              fill="#0EA5E9" 
              maxBarSize={60}
              fillOpacity={0.9}
              fill={(entry) => getBarColor(entry)}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
