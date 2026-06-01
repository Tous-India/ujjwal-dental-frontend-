import api from "../axios";

export const getMyCoupons = () =>
  api.get("/memberships/coupons/my").then((res) => res.data);
