import api from "../axios";

export const getAllCoupons = (params = {}) =>
  api.get("/memberships/coupons/all", { params }).then((res) => res.data);

export const getPatientCoupons = (patientId) =>
  api.get(`/memberships/coupons/patient/${patientId}`).then((res) => res.data);

export const verifyCoupon = (data) =>
  api.post("/memberships/coupons/verify", data).then((res) => res.data);

export const undoCouponUsed = (couponId) =>
  api.patch(`/memberships/coupons/${couponId}/unuse`).then((res) => res.data);
