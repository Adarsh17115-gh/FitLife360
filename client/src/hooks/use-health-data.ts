import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function useHealthMetrics(userId?: number, limit?: number) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useQuery({
    queryKey: ['/api/users/' + id + '/health'],
    enabled: !!id,
  });
}

export function useAddHealthMetric() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (metricData: any) => {
      const response = await apiRequest('POST', '/api/health', metricData);
      return response.json();
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['/api/users/' + user.id + '/health'] });
        toast({
          title: "Health metrics updated",
          description: "Your health data has been successfully recorded.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update health metrics",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useWorkouts(userId?: number) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useQuery({
    queryKey: ['/api/users/' + id + '/workouts'],
    enabled: !!id,
  });
}

export function useUpcomingWorkouts(userId?: number) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useQuery({
    queryKey: ['/api/users/' + id + '/workouts/upcoming'],
    enabled: !!id,
  });
}

export function useAddWorkout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workoutData: any) => {
      const response = await apiRequest('POST', '/api/workouts', workoutData);
      return response.json();
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['/api/users/' + user.id + '/workouts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users/' + user.id + '/workouts/upcoming'] });
        toast({
          title: "Workout added",
          description: "Your workout has been successfully scheduled.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to add workout",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PATCH', `/api/workouts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['/api/users/' + user.id + '/workouts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users/' + user.id + '/workouts/upcoming'] });
        toast({
          title: "Workout updated",
          description: "Your workout has been successfully updated.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update workout",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useNutritionEntries(userId?: number, limit?: number) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useQuery({
    queryKey: ['/api/users/' + id + '/nutrition'],
    enabled: !!id,
  });
}

export function useNutritionSummary(userId?: number) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useQuery({
    queryKey: ['/api/users/' + id + '/nutrition/summary'],
    enabled: !!id,
  });
}

export function useAddNutritionEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (entryData: any) => {
      const response = await apiRequest('POST', '/api/nutrition', entryData);
      return response.json();
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['/api/users/' + user.id + '/nutrition'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users/' + user.id + '/nutrition/summary'] });
        toast({
          title: "Nutrition entry added",
          description: "Your nutrition data has been successfully recorded.",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to add nutrition entry",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useFamilyChallenges(familyId?: number, active: boolean = false) {
  return useQuery({
    queryKey: ['/api/families/' + familyId + '/challenges', { active }],
    enabled: !!familyId,
  });
}

export function useChallengeParticipants(challengeId?: number) {
  return useQuery({
    queryKey: ['/api/challenges/' + challengeId + '/participants'],
    enabled: !!challengeId,
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (challengeData: any) => {
      const response = await apiRequest('POST', '/api/challenges', challengeData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/families/' + data.familyId + '/challenges'] });
      toast({
        title: "Challenge created",
        description: "Your family challenge has been successfully created.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create challenge",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await apiRequest('POST', `/api/challenges/${challengeId}/join`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/' + data.challengeId + '/participants'] });
      toast({
        title: "Challenge joined",
        description: "You have successfully joined the challenge.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to join challenge",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateChallengeProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ participantId, value }: { participantId: number; value: number }) => {
      const response = await apiRequest('PATCH', `/api/challenges/participants/${participantId}/progress`, { value });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/' + data.challengeId + '/participants'] });
      toast({
        title: "Progress updated",
        description: "Your challenge progress has been updated.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}

export function useAiCoachMessages(userId?: number, limit?: number) {
  const { user } = useAuth();
  const id = userId || user?.id;

  return useQuery({
    queryKey: ['/api/users/' + id + '/ai-coach/messages'],
    enabled: !!id,
  });
}

export function useSendMessageToAiCoach() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai-coach/message', { message });
      return response.json();
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['/api/users/' + user.id + '/ai-coach/messages'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });
}
