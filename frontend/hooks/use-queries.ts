import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import {
  fetchMembers,
  fetchMember,
  fetchEvents,
  fetchDashboardStats,
  fetchAnnouncements,
  fetchPrayerRequests,
  fetchDepartments,
  fetchAttendance,
  recordAttendance,
  fetchUsers,
  fetchFinancialData,
  fetchBudgets,
  fetchBudgetSummary,
  fetchFunds,
  fetchFundSummary,
  fetchPledges,
  fetchPledgeSummary,
  fetchFinancialGoals,
  fetchGoalSummary,
  fetchReceipts,
  fetchCashFlowStatement,
  fetchCashFlowEntries,
  fetchForecasts,
  fetchFinancialHealth,
  fetchDecisionSupport,
  fetchMemberContributions,
  fetchTopContributors,
  fetchAuditLogs,
  fetchNotifications,
  fetchBranches,
  fetchDistricts,
} from "@/lib/api-functions"

export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDistricts() {
  return useQuery({
    queryKey: ["districts"],
    queryFn: fetchDistricts,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMembers(params?: { page?: number; size?: number; search?: string }) {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => fetchMembers(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMember(id: number) {
  return useQuery({
    queryKey: ["member", id],
    queryFn: () => fetchMember(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useEvents(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => fetchEvents(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePrayerRequests() {
  return useQuery({
    queryKey: ["prayer-requests"],
    queryFn: fetchPrayerRequests,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAttendance(date?: string) {
  return useQuery({
    queryKey: ["attendance", date],
    queryFn: () => fetchAttendance(date),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecordAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
    },
  })
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFinancialData(params?: {
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
  return useQuery({
    queryKey: ["financial-data", params],
    queryFn: () => fetchFinancialData(params),
    staleTime: 2 * 60 * 1000,
  })
}

export function useFinanceSummary() {
  return useQuery({
    queryKey: ["finance-summary"],
    queryFn: async () => {
      const { data } = await api.get("/finance/summary")
      return data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useBudgets(period?: string) {
  return useQuery({
    queryKey: ["budgets", period],
    queryFn: () => fetchBudgets(period),
    staleTime: 5 * 60 * 1000,
  })
}

export function useBudgetSummary(period: string) {
  return useQuery({
    queryKey: ["budget-summary", period],
    queryFn: () => fetchBudgetSummary(period),
    staleTime: 5 * 60 * 1000,
    enabled: !!period,
  })
}

export function useFunds() {
  return useQuery({
    queryKey: ["funds"],
    queryFn: fetchFunds,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFundSummary() {
  return useQuery({
    queryKey: ["fund-summary"],
    queryFn: fetchFundSummary,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePledges() {
  return useQuery({
    queryKey: ["pledges"],
    queryFn: fetchPledges,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePledgeSummary() {
  return useQuery({
    queryKey: ["pledge-summary"],
    queryFn: fetchPledgeSummary,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFinancialGoals() {
  return useQuery({
    queryKey: ["financial-goals"],
    queryFn: fetchFinancialGoals,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGoalSummary() {
  return useQuery({
    queryKey: ["goal-summary"],
    queryFn: fetchGoalSummary,
    staleTime: 5 * 60 * 1000,
  })
}

export function useReceipts(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["receipts", params],
    queryFn: () => fetchReceipts(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCashFlowStatement(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["cash-flow-statement", startDate, endDate],
    queryFn: () => fetchCashFlowStatement({ startDate, endDate }),
    staleTime: 5 * 60 * 1000,
    enabled: !!startDate && !!endDate,
  })
}

export function useCashFlowEntries(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["cash-flow-entries", params],
    queryFn: () => fetchCashFlowEntries(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useForecasts() {
  return useQuery({
    queryKey: ["forecasts"],
    queryFn: fetchForecasts,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFinancialHealth() {
  return useQuery({
    queryKey: ["financial-health"],
    queryFn: fetchFinancialHealth,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDecisionSupport() {
  return useQuery({
    queryKey: ["decision-support"],
    queryFn: fetchDecisionSupport,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMemberContributions(memberId: number) {
  return useQuery({
    queryKey: ["member-contributions", memberId],
    queryFn: () => fetchMemberContributions(memberId),
    staleTime: 5 * 60 * 1000,
    enabled: !!memberId,
  })
}

export function useTopContributors(limit?: number) {
  return useQuery({
    queryKey: ["top-contributors", limit],
    queryFn: () => fetchTopContributors(limit),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuditLogs(params?: { page?: number; size?: number; entity?: string }) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => fetchAuditLogs(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 2 * 60 * 1000,
  })
}

export function usePendingUsers() {
  return useQuery({
    queryKey: ["pending-users"],
    queryFn: async () => {
      const response = await api.get("/approvals/pending-users")
      return response.data
    },
    staleTime: 30 * 1000,
  })
}

export function useApproveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await api.post(`/approvals/users/${userId}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-users"] })
    },
  })
}

export function useRejectUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason: string }) => {
      const response = await api.post(`/approvals/users/${userId}/reject`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-users"] })
    },
  })
}

export function useChurchRequests() {
  return useQuery({
    queryKey: ["church-requests"],
    queryFn: async () => {
      const response = await api.get("/approvals/church-requests")
      return response.data
    },
    staleTime: 30 * 1000,
  })
}

export function useApproveChurchRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: number) => {
      const response = await api.post(`/approvals/church-requests/${requestId}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["church-requests"] })
    },
  })
}

export function useRejectChurchRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: number; reason: string }) => {
      const response = await api.post(`/approvals/church-requests/${requestId}/reject`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["church-requests"] })
    },
  })
}

export function useSearchChurches(query: string) {
  return useQuery({
    queryKey: ["church-search", query],
    queryFn: async () => {
      const response = await api.get("/approvals/churches/search", { params: { query } })
      return response.data
    },
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  })
}
