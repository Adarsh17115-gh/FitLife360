import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { HealthMetricsData, HealthMetricType } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Heart, MoonStar, Flame, Weight, BarChart3 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function HealthMetrics() {
  const [timeRange, setTimeRange] = useState("week");
  const [activeMetric, setActiveMetric] = useState<HealthMetricType>("all");
  
  const { data, isLoading, error } = useQuery<HealthMetricsData>({
    queryKey: ['/api/health/metrics', timeRange, activeMetric],
  });

  const getMetricIcon = (type: HealthMetricType) => {
    switch (type) {
      case "heartRate":
        return <Heart className="h-6 w-6 text-red-500" />;
      case "steps":
        return <Activity className="h-6 w-6 text-primary-500" />;
      case "sleep":
        return <MoonStar className="h-6 w-6 text-indigo-500" />;
      case "calories":
        return <Flame className="h-6 w-6 text-orange-500" />;
      case "weight":
        return <Weight className="h-6 w-6 text-emerald-500" />;
      default:
        return <BarChart3 className="h-6 w-6 text-gray-500" />;
    }
  };

  const getChartColor = (type: HealthMetricType) => {
    switch (type) {
      case "heartRate":
        return "hsl(0, 84%, 60%)"; // Red
      case "steps":
        return "hsl(var(--primary))"; // Primary color
      case "sleep":
        return "hsl(245, 58%, 51%)"; // Indigo
      case "calories":
        return "hsl(24, 95%, 53%)"; // Orange
      case "weight":
        return "hsl(152, 60%, 52%)"; // Emerald
      default:
        return "hsl(var(--primary))";
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-lg font-semibold">Health Metrics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track and analyze your health data</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>Add Measurement</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar - Metrics Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Metrics</CardTitle>
                <CardDescription>View your health data</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 p-2">
                  <Button 
                    variant={activeMetric === "all" ? "default" : "ghost"}
                    className="w-full justify-start" 
                    onClick={() => setActiveMetric("all")}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    All Metrics
                  </Button>
                  <Button 
                    variant={activeMetric === "heartRate" ? "default" : "ghost"}
                    className="w-full justify-start" 
                    onClick={() => setActiveMetric("heartRate")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Heart Rate
                  </Button>
                  <Button 
                    variant={activeMetric === "steps" ? "default" : "ghost"}
                    className="w-full justify-start" 
                    onClick={() => setActiveMetric("steps")}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    Steps
                  </Button>
                  <Button 
                    variant={activeMetric === "sleep" ? "default" : "ghost"}
                    className="w-full justify-start" 
                    onClick={() => setActiveMetric("sleep")}
                  >
                    <MoonStar className="mr-2 h-4 w-4" />
                    Sleep
                  </Button>
                  <Button 
                    variant={activeMetric === "calories" ? "default" : "ghost"}
                    className="w-full justify-start" 
                    onClick={() => setActiveMetric("calories")}
                  >
                    <Flame className="mr-2 h-4 w-4" />
                    Calories
                  </Button>
                  <Button 
                    variant={activeMetric === "weight" ? "default" : "ghost"}
                    className="w-full justify-start" 
                    onClick={() => setActiveMetric("weight")}
                  >
                    <Weight className="mr-2 h-4 w-4" />
                    Weight
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Metrics Display */}
          <div className="lg:col-span-4 space-y-6">
            {isLoading ? (
              <>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-6 w-24 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : error ? (
              <Card>
                <CardContent className="p-6">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
                    Failed to load health metrics. Please try again later.
                  </div>
                </CardContent>
              </Card>
            ) : data ? (
              <>
                {/* Chart Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>{activeMetric === "all" ? "All Health Metrics" : data.metrics.find(m => m.type === activeMetric)?.name}</CardTitle>
                    <CardDescription>
                      {timeRange === "day" && "Today's data"}
                      {timeRange === "week" && "This week's data"}
                      {timeRange === "month" && "This month's data"}
                      {timeRange === "year" && "This year's data"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={data.chartData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis 
                            dataKey="date" 
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
                            domain={['auto', 'auto']}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom"
                            height={36}
                          />
                          {activeMetric === "all" ? (
                            data.metrics.map((metric) => (
                              <Line
                                key={metric.type}
                                type="monotone"
                                dataKey={metric.type}
                                name={metric.name}
                                stroke={getChartColor(metric.type)}
                                strokeWidth={2}
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                              />
                            ))
                          ) : (
                            <Line
                              type="monotone"
                              dataKey={activeMetric}
                              name={data.metrics.find(m => m.type === activeMetric)?.name}
                              stroke={getChartColor(activeMetric)}
                              strokeWidth={3}
                              dot={{ r: 5, strokeWidth: 2 }}
                              activeDot={{ r: 7 }}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.metrics.map((metric) => (
                    <Card 
                      key={metric.type} 
                      className={activeMetric !== "all" && activeMetric !== metric.type ? "hidden" : ""}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            {getMetricIcon(metric.type)}
                          </div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {metric.change > 0 ? `+${metric.change}%` : `${metric.change}%`} from last {timeRange}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">
                          {metric.current}
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                            {metric.unit}
                          </span>
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">{metric.name}</p>
                        {metric.goal && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Goal Progress</span>
                              <span>{Math.round((metric.current / metric.goal) * 100)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                              <div 
                                className="h-full rounded-full"
                                style={{ 
                                  width: `${Math.min(100, (metric.current / metric.goal) * 100)}%`,
                                  backgroundColor: getChartColor(metric.type)
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Detailed Metrics Table */}
                {activeMetric !== "all" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed {data.metrics.find(m => m.type === activeMetric)?.name} History</CardTitle>
                      <CardDescription>Recent measurements and trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {data.chartData.map((entry, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{entry.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{entry[activeMetric]} {data.metrics.find(m => m.type === activeMetric)?.unit}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {index < data.chartData.length - 1 ? (
                                    <span className={`inline-flex items-center ${
                                      entry[activeMetric] > data.chartData[index + 1][activeMetric] 
                                        ? 'text-green-500' 
                                        : entry[activeMetric] < data.chartData[index + 1][activeMetric]
                                          ? 'text-red-500'
                                          : 'text-gray-500'
                                    }`}>
                                      {entry[activeMetric] > data.chartData[index + 1][activeMetric] && '↑ '}
                                      {entry[activeMetric] < data.chartData[index + 1][activeMetric] && '↓ '}
                                      {entry[activeMetric] === data.chartData[index + 1][activeMetric] && '→ '}
                                      {Math.abs(entry[activeMetric] - data.chartData[index + 1][activeMetric])} {data.metrics.find(m => m.type === activeMetric)?.unit}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
