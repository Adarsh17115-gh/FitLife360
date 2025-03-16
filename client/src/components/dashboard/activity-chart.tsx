import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type TimeRange = "week" | "month" | "year";

interface ActivityChartProps {
  userId: number;
  familyId: number;
}

export default function ActivityChart({ userId, familyId }: ActivityChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  
  // Get user activities
  const { data: userActivities } = useQuery({
    queryKey: ["/api/users", userId, "activities", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/activities`);
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      return response.json();
    }
  });
  
  // Get family members
  const { data: familyMembers } = useQuery({
    queryKey: ["/api/families", familyId, "members"],
    queryFn: async () => {
      const response = await fetch(`/api/families/${familyId}/members`);
      if (!response.ok) {
        throw new Error("Failed to fetch family members");
      }
      return response.json();
    }
  });
  
  // Prepare chart data
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    if (!userActivities) return;
    
    // This is a simplified data preparation logic
    // In a real app, this would be more sophisticated based on the timeRange
    
    let data = [];
    if (timeRange === "week") {
      data = [
        { day: "Mon", userActivity: 40, familyAverage: 45 },
        { day: "Tue", userActivity: 65, familyAverage: 55 },
        { day: "Wed", userActivity: 50, familyAverage: 48 },
        { day: "Thu", userActivity: 70, familyAverage: 60 },
        { day: "Fri", userActivity: 45, familyAverage: 50 },
        { day: "Sat", userActivity: 85, familyAverage: 75 },
        { day: "Sun", userActivity: 60, familyAverage: 55 }
      ];
    } else if (timeRange === "month") {
      data = [
        { day: "Week 1", userActivity: 55, familyAverage: 50 },
        { day: "Week 2", userActivity: 60, familyAverage: 55 },
        { day: "Week 3", userActivity: 70, familyAverage: 65 },
        { day: "Week 4", userActivity: 65, familyAverage: 60 }
      ];
    } else {
      data = [
        { day: "Jan", userActivity: 50, familyAverage: 45 },
        { day: "Feb", userActivity: 55, familyAverage: 50 },
        { day: "Mar", userActivity: 60, familyAverage: 55 },
        { day: "Apr", userActivity: 65, familyAverage: 60 },
        { day: "May", userActivity: 70, familyAverage: 65 },
        { day: "Jun", userActivity: 75, familyAverage: 70 },
        { day: "Jul", userActivity: 80, familyAverage: 75 },
        { day: "Aug", userActivity: 85, familyAverage: 80 },
        { day: "Sep", userActivity: 80, familyAverage: 75 },
        { day: "Oct", userActivity: 75, familyAverage: 70 },
        { day: "Nov", userActivity: 70, familyAverage: 65 },
        { day: "Dec", userActivity: 65, familyAverage: 60 }
      ];
    }
    
    setChartData(data);
  }, [userActivities, timeRange]);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-heading font-semibold text-neutral-900 dark:text-neutral-100">Weekly Activity</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setTimeRange("week")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === "week" 
                ? "bg-primary-50 dark:bg-primary-dark text-primary dark:text-primary-foreground font-medium" 
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => setTimeRange("month")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === "month" 
                ? "bg-primary-50 dark:bg-primary-dark text-primary dark:text-primary-foreground font-medium" 
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
          >
            Month
          </button>
          <button 
            onClick={() => setTimeRange("year")}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === "year" 
                ? "bg-primary-50 dark:bg-primary-dark text-primary dark:text-primary-foreground font-medium" 
                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorUserActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorFamilyAverage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: 'var(--foreground)' }}
                tickLine={{ stroke: 'var(--foreground)' }}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                hide 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="familyAverage" 
                name="Family Average"
                stroke="var(--primary)" 
                fillOpacity={1}
                fill="url(#colorFamilyAverage)" 
              />
              <Area 
                type="monotone" 
                dataKey="userActivity" 
                name="Your Activity"
                stroke="var(--accent)" 
                fillOpacity={1}
                fill="url(#colorUserActivity)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-neutral-500 dark:text-neutral-400">Loading activity data...</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center space-x-6">
        <div className="flex items-center">
          <div className="h-3 w-3 bg-primary rounded-full mr-2"></div>
          <span className="text-sm text-neutral-700 dark:text-neutral-300">Family Average</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 bg-accent rounded-full mr-2"></div>
          <span className="text-sm text-neutral-700 dark:text-neutral-300">Your Activity</span>
        </div>
      </div>
    </div>
  );
}
