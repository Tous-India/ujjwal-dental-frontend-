import api from "../axios";

const buildParams = (obj) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.append(k, v);
  });
  return params;
};

export const getExpenses = (filters = {}) =>
  api.get("/expenses", { params: buildParams(filters) }).then((r) => r.data);

export const getExpenseById = (id) =>
  api.get(`/expenses/${id}`).then((r) => r.data);

export const createExpense = (data) =>
  api.post("/expenses", data).then((r) => r.data);

export const updateExpense = (id, data) =>
  api.patch(`/expenses/${id}`, data).then((r) => r.data);

export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`).then((r) => r.data);

export const getExpenseStats = (filters = {}) =>
  api.get("/expenses/stats", { params: buildParams(filters) }).then((r) => r.data);

export const getProfitLoss = (filters = {}) =>
  api.get("/expenses/pnl", { params: buildParams(filters) }).then((r) => r.data);

export const getExpenseStaff = () =>
  api.get("/expenses/staff").then((r) => r.data);
