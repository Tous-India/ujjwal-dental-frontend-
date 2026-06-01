import { useQuery } from "@tanstack/react-query";
import { getMyCoupons } from "../../api/patient/coupons.api";

export const useMyCoupons = () => {
  return useQuery({
    queryKey: ["patient", "my-coupons"],
    queryFn: getMyCoupons,
    staleTime: 30 * 1000,
  });
};
