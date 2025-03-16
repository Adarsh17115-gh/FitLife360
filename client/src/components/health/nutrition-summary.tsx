import { useNutritionSummary } from '@/hooks/use-health-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface NutritionSummaryProps {
  userId: number;
  className?: string;
}

export function NutritionSummary({ userId, className = '' }: NutritionSummaryProps) {
  const { data: nutritionSummary, isLoading } = useNutritionSummary(userId);
  
  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle className="text-lg font-semibold">Today's Nutrition</CardTitle>
          <Button variant="link" size="sm" className="text-primary-600 dark:text-primary-400">
            View all
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {Array(5).fill(0).map((_, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            ))}
          </div>
          <div className="mt-6 animate-pulse">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg h-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nutritionSummary) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="flex justify-between items-center pb-2">
          <CardTitle className="text-lg font-semibold">Today's Nutrition</CardTitle>
          <Button variant="link" size="sm" className="text-primary-600 dark:text-primary-400">
            View all
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No nutrition data available for today
          </p>
        </CardContent>
      </Card>
    );
  }

  // Goals
  const goals = {
    calories: 2200,
    protein: 120,
    carbs: 250,
    fat: 70,
    water: 2500 // in ml
  };

  // Current values
  const current = {
    calories: nutritionSummary.calories,
    protein: nutritionSummary.protein,
    carbs: nutritionSummary.carbs,
    fat: nutritionSummary.fat,
    water: 1200 // Placeholder value
  };

  // Calculate percentages
  const percentages = {
    calories: Math.min(Math.round((current.calories / goals.calories) * 100), 100),
    protein: Math.min(Math.round((current.protein / goals.protein) * 100), 100),
    carbs: Math.min(Math.round((current.carbs / goals.carbs) * 100), 100),
    fat: Math.min(Math.round((current.fat / goals.fat) * 100), 100),
    water: Math.min(Math.round((current.water / goals.water) * 100), 100)
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle className="text-lg font-semibold">Today's Nutrition</CardTitle>
        <Button variant="link" size="sm" className="text-primary-600 dark:text-primary-400">
          View all
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Calories</span>
              <span className="text-sm">{current.calories.toLocaleString()} / {goals.calories.toLocaleString()} kcal</span>
            </div>
            <Progress value={percentages.calories} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Protein</span>
              <span className="text-sm">{current.protein} / {goals.protein} g</span>
            </div>
            <Progress value={percentages.protein} className="h-2 bg-gray-100 dark:bg-gray-700">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentages.protein}%` }}></div>
            </Progress>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Carbs</span>
              <span className="text-sm">{current.carbs} / {goals.carbs} g</span>
            </div>
            <Progress value={percentages.carbs} className="h-2 bg-gray-100 dark:bg-gray-700">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${percentages.carbs}%` }}></div>
            </Progress>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Fat</span>
              <span className="text-sm">{current.fat} / {goals.fat} g</span>
            </div>
            <Progress value={percentages.fat} className="h-2 bg-gray-100 dark:bg-gray-700">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percentages.fat}%` }}></div>
            </Progress>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Water</span>
              <span className="text-sm">{(current.water / 1000).toFixed(1)} / {(goals.water / 1000).toFixed(1)} L</span>
            </div>
            <Progress value={percentages.water} className="h-2 bg-gray-100 dark:bg-gray-700">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${percentages.water}%` }}></div>
            </Progress>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">AI Recommendation</h3>
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              Based on your activity level today, consider increasing your protein intake and drinking more water to reach your daily goals.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
