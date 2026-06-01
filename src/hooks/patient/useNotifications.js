import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../api/patient/notifications.api";

export const usePatientNotifications = (params = {}) => {
  return useQuery({
    queryKey: ["patient", "notifications", params],
    queryFn: () => getMyNotifications(params),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export const usePatientUnreadCount = () => {
  return useQuery({
    queryKey: ["patient", "notifications", "unread-count"],
    queryFn: getUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
};

export const usePatientNotificationMutations = () => {
  const queryClient = useQueryClient();

  const read = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", "notifications"] });
    },
  });

  const readAll = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", "notifications"] });
    },
  });

  return {
    markAsRead: read.mutate,
    markAsReadAsync: read.mutateAsync,
    markAllAsRead: readAll.mutate,
    markAllAsReadAsync: readAll.mutateAsync,
    isMarkingRead: read.isPending,
  };
};
