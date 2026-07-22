import api from "@/lib/api"

export async function fetchMembers(params?: { page?: number; size?: number; search?: string }) {
  const response = await api.get("/members", { params })
  return response.data
}

export async function fetchMember(id: number) {
  const response = await api.get(`/members/${id}`)
  return response.data
}

export async function fetchEvents(params?: { page?: number; size?: number }) {
  const response = await api.get("/events", { params })
  return response.data
}

export async function fetchDashboardStats() {
  const [dashboard, members, attendance, finances] = await Promise.all([
    api.get("/dashboard"),
    api.get("/members/stats"),
    api.get("/attendance/stats"),
    api.get("/finance/summary"),
  ])
  return {
    totalMembers: dashboard.data.totalMembers ?? members.data.totalMembers ?? 0,
    activeMembers: dashboard.data.activeMembers ?? members.data.activeMembers ?? 0,
    attendanceToday: dashboard.data.attendanceToday ?? 0,
    totalDonations: dashboard.data.totalDonations ?? finances.data.totalDonations ?? 0,
    totalExpenses: dashboard.data.totalExpenses ?? 0,
    netBalance: dashboard.data.netBalance ?? 0,
    upcomingEvents: dashboard.data.upcomingEvents ?? attendance.data.upcomingEvents ?? 0,
    pendingPrayerRequests: dashboard.data.pendingPrayerRequests ?? 0,
    monthlyFinancials: dashboard.data.monthlyFinancials ?? [],
    attendanceTrends: dashboard.data.attendanceTrends ?? [],
  }
}

export async function fetchAnnouncements() {
  const response = await api.get("/announcements")
  return response.data
}

export async function fetchPrayerRequests() {
  const response = await api.get("/prayer-requests")
  return response.data
}

export async function fetchDepartments() {
  const response = await api.get("/departments")
  return response.data
}

export async function fetchAttendance(date?: string) {
  const dateParam = date || new Date().toISOString().split("T")[0]
  const response = await api.get("/attendance", { params: { date: dateParam } })
  return response.data
}

export async function recordAttendance(data: { memberId: number; serviceDate: string; serviceType: string; present: boolean }) {
  const response = await api.post("/attendance", data)
  return response.data
}

export async function fetchUsers() {
  const response = await api.get("/users")
  return response.data.content ?? response.data
}

function unwrapPage(data: any) {
  if (Array.isArray(data)) {
    return { content: data, totalPages: 1, totalElements: data.length, number: 0 }
  }
  return {
    content: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    number: data?.number ?? 0,
  }
}

export async function fetchFinancialData(params?: {
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  pages?: {
    donations?: number
    tithes?: number
    offerings?: number
    expenses?: number
  }
}) {
  const buildParams = (pageOverride?: number) => {
    const query: Record<string, string | number> = {}
    if (params?.startDate) query.startDate = params.startDate
    if (params?.endDate) query.endDate = params.endDate
    const page = pageOverride ?? params?.page
    if (page !== undefined) query.page = page
    if (params?.size !== undefined) query.size = params.size
    return query
  }

  const [donations, tithes, offerings, expenses] = await Promise.all([
    api.get("/finance/donations", { params: buildParams(params?.pages?.donations) }),
    api.get("/finance/tithes", { params: buildParams(params?.pages?.tithes) }),
    api.get("/finance/offerings", { params: buildParams(params?.pages?.offerings) }),
    api.get("/finance/expenses", { params: buildParams(params?.pages?.expenses) }),
  ])

  const donationsPage = unwrapPage(donations.data)
  const tithesPage = unwrapPage(tithes.data)
  const offeringsPage = unwrapPage(offerings.data)
  const expensesPage = unwrapPage(expenses.data)

  return {
    donations: donationsPage.content,
    tithes: tithesPage.content,
    offerings: offeringsPage.content,
    expenses: expensesPage.content,
    meta: {
      donations: donationsPage,
      tithes: tithesPage,
      offerings: offeringsPage,
      expenses: expensesPage,
    },
  }
}

export async function fetchBudgets(period?: string) {
  const response = await api.get("/budgets", { params: period ? { period } : {} })
  return response.data
}

export async function fetchBudgetSummary(period: string) {
  const response = await api.get("/budgets/summary", { params: { period } })
  return response.data
}

export async function fetchFunds() {
  const response = await api.get("/funds")
  return response.data
}

export async function fetchFundSummary() {
  const response = await api.get("/funds/summary")
  return response.data
}

export async function fetchFundTransactions(fundId: number) {
  const response = await api.get(`/funds/${fundId}/transactions`)
  return response.data
}

export async function fetchPledges() {
  const response = await api.get("/pledges")
  return response.data
}

export async function fetchPledgeSummary() {
  const response = await api.get("/pledges/summary")
  return response.data
}

export async function fetchFinancialGoals() {
  const response = await api.get("/financial-goals")
  return response.data
}

export async function fetchGoalSummary() {
  const response = await api.get("/financial-goals/summary")
  return response.data
}

export async function fetchReceipts(params?: { startDate?: string; endDate?: string }) {
  const response = await api.get("/receipts", { params })
  return response.data
}

export async function fetchCashFlowStatement(params: { startDate: string; endDate: string }) {
  const response = await api.get("/cash-flow/statement", { params })
  return response.data
}

export async function fetchCashFlowEntries(params?: { startDate?: string; endDate?: string }) {
  const endpoint = params?.startDate || params?.endDate ? "/cash-flow/range" : "/cash-flow"
  const response = await api.get(endpoint, { params })
  return response.data
}

export async function fetchForecasts() {
  const response = await api.get("/forecasts")
  return response.data
}

export async function fetchFinancialHealth() {
  const response = await api.get("/financial-health")
  return response.data
}

export async function fetchDecisionSupport() {
  const response = await api.get("/financial-health/decision-support")
  return response.data
}

export async function fetchMemberContributions(memberId: number) {
  const response = await api.get(`/finance/members/${memberId}/contributions`)
  return response.data
}

export async function fetchTopContributors(limit?: number) {
  const response = await api.get("/finance/contributors/top", { params: limit ? { limit } : {} })
  return response.data
}

export async function fetchAuditLogs(params?: { page?: number; size?: number; entity?: string }) {
  const response = await api.get("/audit-logs", { params })
  return response.data
}

export async function fetchNotifications() {
  const response = await api.get("/notifications")
  return response.data
}

export async function fetchBranches() {
  const response = await api.get("/branches")
  return response.data
}

export async function fetchDistricts() {
  const response = await api.get("/districts")
  return response.data
}

export const churchSettingsApi = {
  get: () => api.get("/church-settings"),
  update: (data: any) => api.put("/church-settings", data),
  uploadLogo: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/church-settings/logo", fd, { headers: { "Content-Type": "multipart/form-data" } });
  }
};

export const permissionApi = {
  getAll: () => api.get("/permissions"),
  getRole: (role: string) => api.get(`/permissions/role/${role}`),
  update: (data: any) => api.put("/permissions", data),
  check: (resource: string, action: string) => api.get(`/permissions/check?resource=${resource}&action=${action}`)
};

export const currencyApi = {
  list: () => api.get("/currencies"),
  rates: (base: string) => api.get(`/currencies/rates?base=${base}`),
  convert: (amount: number, from: string, to: string) => api.get(`/currencies/convert?amount=${amount}&from=${from}&to=${to}`)
};

export const dataExportApi = {
  members: () => api.get("/reports/export/members", { responseType: "blob" }),
  donations: (from: string, to: string) => api.get(`/reports/export/donations?from=${from}&to=${to}`, { responseType: "blob" }),
  expenses: (from: string, to: string) => api.get(`/reports/export/expenses?from=${from}&to=${to}`, { responseType: "blob" }),
  budgets: () => api.get("/reports/export/budgets", { responseType: "blob" }),
  financialSummary: () => api.get("/reports/export/financial-summary/pdf", { responseType: "blob" })
};

export const visitorApi = {
  record: (data: any) => api.post("/visitors", data),
  list: (from: string, to: string) => api.get(`/visitors?from=${from}&to=${to}`),
  stats: () => api.get("/visitors/stats"),
  trend: (months: number) => api.get(`/visitors/trend?months=${months}`),
  updateFollowUp: (id: number, data: any) => api.put(`/visitors/${id}/follow-up`, data),
  followUpList: () => api.get("/visitors/follow-up"),
};

export const analyticsApi = {
  donorRetention: {
    calculate: (period: string) => api.get(`/analytics/donor-retention/calculate?period=${period}`),
    report: (period: string) => api.get(`/analytics/donor-retention/report?period=${period}`),
    trend: (quarters: number) => api.get(`/analytics/donor-retention/trend?quarters=${quarters}`)
  },
  givingPatterns: {
    heatmap: (from: string, to: string) => api.get(`/analytics/giving-patterns/heatmap?from=${from}&to=${to}`),
    byDay: (from: string, to: string) => api.get(`/analytics/giving-patterns/by-day?from=${from}&to=${to}`),
    byMonth: (year: number) => api.get(`/analytics/giving-patterns/by-month?year=${year}`),
    topDonors: (from: string, to: string, limit: number) => api.get(`/analytics/giving-patterns/top-donors?from=${from}&to=${to}&limit=${limit}`),
    distribution: (from: string, to: string) => api.get(`/analytics/giving-patterns/distribution?from=${from}&to=${to}`),
    average: (from: string, to: string) => api.get(`/analytics/giving-patterns/average?from=${from}&to=${to}`)
  },
  forecasting: {
    generate: (period: string, method: string) => api.post("/analytics/forecasting/generate", { period, method }),
    list: () => api.get("/analytics/forecasting"),
    accuracy: () => api.get("/analytics/forecasting/accuracy"),
    yearEnd: () => api.get("/analytics/forecasting/year-end")
  },
  churchComparison: {
    metrics: (churchId: number) => api.get(`/admin/church-comparison/metrics/${churchId}`),
    compare: (ids: number[]) => api.get(`/admin/church-comparison/compare?ids=${ids.join(",")}`),
    topGiving: (limit: number) => api.get(`/admin/church-comparison/top-giving?limit=${limit}`),
    platformOverview: () => api.get("/admin/church-comparison/platform-overview"),
    healthScores: () => api.get("/admin/church-comparison/health-scores")
  }
};

export const transferApi = {
  request: (data: any) => api.post("/church-transfers", data),
  approve: (id: number) => api.put(`/church-transfers/${id}/approve`),
  reject: (id: number, reason: string) => api.put(`/church-transfers/${id}/reject`, { reason }),
  list: () => api.get("/church-transfers"),
  pending: () => api.get("/church-transfers/pending")
};

export const importApi = {
  members: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/import/members", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  donations: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/import/donations", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  expenses: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/import/expenses", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  history: () => api.get("/import/history"),
  errors: (id: number) => api.get(`/import/${id}/errors`)
};

export const apiKeyApi = {
  generate: (data: any) => api.post("/api-keys", data),
  list: () => api.get("/api-keys"),
  revoke: (id: number) => api.put(`/api-keys/${id}/revoke`),
  regenerate: (id: number) => api.post(`/api-keys/${id}/regenerate`)
};

export const brandingApi = {
  get: () => api.get("/white-label"),
  update: (data: any) => api.put("/white-label", data),
  css: () => api.get("/white-label/css"),
  uploadDarkLogo: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/white-label/logo-dark", fd, { headers: { "Content-Type": "multipart/form-data" } });
  }
};

export const twoFactorApi = {
  setup: () => api.post("/2fa/setup"),
  enable: (code: string) => api.post("/2fa/enable", { code }),
  disable: (password: string) => api.post("/2fa/disable", { password }),
  verify: (code: string) => api.post("/2fa/verify", { code }),
  backupCodes: () => api.post("/2fa/backup-codes"),
  status: () => api.get("/2fa/status")
};

export const subscriptionApi = {
  getPlans: () => api.get("/subscriptions/plans"),
  getPlan: (id: number) => api.get(`/subscriptions/plans/${id}`),
  initialize: (planId: number, billingCycle: string = "MONTHLY") =>
    api.post("/subscriptions/initialize", { planId, billingCycle }),
  verify: (reference: string) => api.get(`/subscriptions/verify/${reference}`),
  getHistory: () => api.get("/subscriptions/history"),
  getPublicKey: () => api.get("/subscriptions/public-key"),
  getCurrentSubscription: () => api.get("/churches/current/subscription"),
};
