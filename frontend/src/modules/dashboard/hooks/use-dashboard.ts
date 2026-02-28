"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { mapDashboardOverviewToScreenData } from "@/modules/dashboard/mappers/dashboard.mapper";
import {
  getDashboardOverview,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/modules/dashboard/services/dashboard.service";
import { queryKeys } from "@/shared/lib/api/query-keys";

export function useDashboardScreenData() {
  const overviewQuery = useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: getDashboardOverview,
  });

  const data = overviewQuery.data
    ? mapDashboardOverviewToScreenData(overviewQuery.data)
    : undefined;

  return {
    data,
    isLoading: overviewQuery.isLoading,
    isFetching: overviewQuery.isFetching,
    hasAnyError: overviewQuery.isError,
  };
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.notifications(),
    queryFn: getNotifications,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.notifications(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.overview(),
      });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.notifications(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.overview(),
      });
    },
  });
}
