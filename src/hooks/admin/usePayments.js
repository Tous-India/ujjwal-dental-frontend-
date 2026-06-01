/**
 * Admin Payments Hook (React Query)
 *
 * Custom hook for managing payments data.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPayments,
  getPayment,
  createPayment,
  processRefund,
  getPaymentStats,
  deletePayment,
} from "../../api/admin/payments.api";

/**
 * Hook for fetching payments list
 * @param {Object} params - Query parameters (page, limit, search, etc.)
 */
export const usePayments = (params = {}) => {
  return useQuery({
    queryKey: ["admin", "payments", params],
    queryFn: () => getPayments(params),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook for fetching single payment
 * @param {string} id - Payment ID
 */
export const usePayment = (id) => {
  return useQuery({
    queryKey: ["admin", "payments", id],
    queryFn: () => getPayment(id),
    enabled: !!id,
  });
};

/**
 * Hook for fetching payment statistics
 * @param {Object} params - Query params (clinic, from, to)
 */
export const usePaymentStats = (params = {}) => {
  return useQuery({
    queryKey: ["admin", "payments", "stats", params],
    queryFn: () => getPaymentStats(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for payment mutations (create, refund)
 */
export const usePaymentMutations = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "billing"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const refund = useMutation({
    mutationFn: ({ id, data }) => processRefund(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "billing"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "billing"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  return {
    createPayment: create.mutate,
    createPaymentAsync: create.mutateAsync,
    isCreating: create.isPending,
    createError: create.error,

    processRefund: refund.mutate,
    isRefunding: refund.isPending,
    refundError: refund.error,

    deletePayment: remove.mutate,
    isDeleting: remove.isPending,
  };
};

export default usePayments;
