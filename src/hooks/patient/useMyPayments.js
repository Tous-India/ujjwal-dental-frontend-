/**
 * Patient Payments Hook (React Query)
 *
 * Custom hook for patients to access their payment history.
 */
import { useQuery } from "@tanstack/react-query";
import { getMyPayments } from "../../api/patient/payments.api";
import { useAuthStore } from "../../store/auth.store";

/**
 * Hook for fetching patient's payments
 * @param {Object} params - { page, limit }
 */
export const useMyPayments = (params = {}) => {
  const patient = useAuthStore((state) => state.patient);

  return useQuery({
    queryKey: ["patient", "payments", patient?._id, params],
    queryFn: () => getMyPayments(patient?._id, params),
    enabled: !!patient?._id,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export default useMyPayments;
