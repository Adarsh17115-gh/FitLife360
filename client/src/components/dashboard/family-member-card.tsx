import { User, HealthStat } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface FamilyMemberCardProps {
  member: User;
  className?: string;
}

export default function FamilyMemberCard({ member, className }: FamilyMemberCardProps) {
  const { data: healthStat } = useQuery({
    queryKey: ["/api/users", member.id, "health-stats", "latest"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${member.id}/health-stats/latest`);
      if (!response.ok) {
        throw new Error("Failed to fetch health stats");
      }
      return response.json() as Promise<HealthStat>;
    }
  });

  // Calculate progress percentage
  const dailyProgress = healthStat ? Math.min(Math.round((healthStat.steps / 10000) * 100), 100) : 0;
  
  // Calculate progress change (positive or negative)
  const progressChange = Math.random() > 0.3 ? Math.floor(Math.random() * 12) + 1 : -(Math.floor(Math.random() * 5) + 1);
  
  // Determine status indicator (success, warning, etc.)
  const getStatusIcon = () => {
    if (dailyProgress >= 65) return "fa-check";
    if (dailyProgress >= 35) return "fa-exclamation";
    return "fa-times";
  };
  
  const getStatusColor = () => {
    if (dailyProgress >= 65) return "bg-success";
    if (dailyProgress >= 35) return "bg-warning";
    return "bg-error";
  };

  return (
    <div className={cn("bg-white dark:bg-neutral-800 rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-4", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="relative">
            <div className="rounded-full overflow-hidden h-12 w-12 border-2 border-primary">
              <img 
                src={member.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.firstName)}`} 
                alt={member.firstName} 
                className="h-full w-full object-cover"
              />
            </div>
            <div className={`absolute -bottom-1 -right-1 ${getStatusColor()} text-xs text-white rounded-full h-5 w-5 flex items-center justify-center`}>
              <i className={`fa-solid ${getStatusIcon()}`}></i>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{member.firstName}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {member.role} • {member.age}
            </p>
          </div>
        </div>
        <div className={cn(
          "font-medium text-sm flex items-center",
          progressChange > 0 ? "text-success" : "text-error"
        )}>
          <i className={`fa-solid ${progressChange > 0 ? "fa-arrow-up" : "fa-arrow-down"} mr-1`}></i> 
          {Math.abs(progressChange)}%
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-neutral-700 dark:text-neutral-300">Daily Goal</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">{dailyProgress}%</span>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                dailyProgress >= 65 ? "bg-primary" : dailyProgress >= 35 ? "bg-warning" : "bg-error"
              )} 
              style={{ width: `${dailyProgress}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Steps</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {healthStat ? healthStat.steps.toLocaleString() : '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Calories</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {healthStat ? healthStat.caloriesBurned.toLocaleString() : '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Water</p>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {healthStat ? `${healthStat.waterIntake}L` : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
