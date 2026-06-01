/**
 * Membership Plans React Query Hooks
 *
 * Custom hooks for membership plan data fetching and mutations.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMembershipPlans,
  getMembershipPlan,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  seedDefaultPlans,
  getActiveMembers,
  getMembershipStats,
  assignMembership,
  renewMembership,
  cancelMembership,
} from "../../api/admin/memberships.api";

/**
 * Query key factory
 */
const membershipKeys = {
  all: ["admin", "memberships"],
  plans: () => [...membershipKeys.all, "plans"],
  plan: (id) => [...membershipKeys.plans(), id],
  members: () => [...membershipKeys.all, "members"],
  stats: () => [...membershipKeys.all, "stats"],
};

/**
 * Hook to fetch all membership plans
 */
export const useMembershipPlans = (params = {}) => {
  return useQuery({
    queryKey: [...membershipKeys.plans(), params],
    queryFn: () => getMembershipPlans(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch single membership plan
 */
export const useMembershipPlan = (id) => {
  return useQuery({
    queryKey: membershipKeys.plan(id),
    queryFn: () => getMembershipPlan(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch active members
 */
export const useActiveMembers = (params = {}) => {
  return useQuery({
    queryKey: [...membershipKeys.members(), params],
    queryFn: () => getActiveMembers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch membership statistics
 */
export const useMembershipStats = () => {
  return useQuery({
    queryKey: membershipKeys.stats(),
    queryFn: getMembershipStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for membership plan mutations (create, update, delete)
 */
export const useMembershipMutations = () => {
  const queryClient = useQueryClient();

  const invalidatePlans = () => {
    queryClient.invalidateQueries({ queryKey: membershipKeys.plans() });
  };

  const createPlan = useMutation({
    mutationFn: createMembershipPlan,
    onSuccess: invalidatePlans,
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, data }) => updateMembershipPlan(id, data),
    onSuccess: invalidatePlans,
  });

  const deletePlan = useMutation({
    mutationFn: deleteMembershipPlan,
    onSuccess: invalidatePlans,
  });

  const seedPlans = useMutation({
    mutationFn: seedDefaultPlans,
    onSuccess: invalidatePlans,
  });

  const assign = useMutation({
    mutationFn: assignMembership,
    onSuccess: () => {
      invalidatePlans();
      queryClient.invalidateQueries({ queryKey: ["admin", "patients"] });
    },
  });

  const renew = useMutation({
    mutationFn: renewMembership,
    onSuccess: () => {
      invalidatePlans();
      queryClient.invalidateQueries({ queryKey: ["admin", "patients"] });
    },
  });

  const cancel = useMutation({
    mutationFn: cancelMembership,
    onSuccess: () => {
      invalidatePlans();
      queryClient.invalidateQueries({ queryKey: ["admin", "patients"] });
    },
  });

  return {
    createPlan: createPlan.mutate,
    updatePlan: updatePlan.mutate,
    deletePlan: deletePlan.mutate,
    seedPlans: seedPlans.mutate,
    assignMembership: assign.mutate,
    renewMembership: renew.mutate,
    cancelMembership: cancel.mutate,
    isCreating: createPlan.isPending,
    isUpdating: updatePlan.isPending,
    isDeleting: deletePlan.isPending,
    isSeeding: seedPlans.isPending,
    isAssigning: assign.isPending,
    isRenewing: renew.isPending,
    isCancellingMembership: cancel.isPending,
  };
};

export default useMembershipPlans;
