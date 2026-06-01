import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllCoupons, getPatientCoupons, verifyCoupon, undoCouponUsed } from "../../api/admin/coupons.api";

export const useAllCoupons = (params = {}) => {
  return useQuery({
    queryKey: ["admin", "all-coupons", params],
    queryFn: () => getAllCoupons(params),
    staleTime: 30 * 1000,
  });
};

export const usePatientCoupons = (patientId) => {
  return useQuery({
    queryKey: ["admin", "patient-coupons", patientId],
    queryFn: () => getPatientCoupons(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  });
};

export const useCouponMutations = () => {
  const queryClient = useQueryClient();

  const verify = useMutation({
    mutationFn: verifyCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "patient-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-coupons"] });
    },
  });

  const undo = useMutation({
    mutationFn: undoCouponUsed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "patient-coupons"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "all-coupons"] });
    },
  });

  return {
    verifyCoupon: verify.mutate,
    verifyCouponAsync: verify.mutateAsync,
    isVerifying: verify.isPending,
    verifyError: verify.error,
    undoCoupon: undo.mutate,
    isUndoing: undo.isPending,
  };
};
