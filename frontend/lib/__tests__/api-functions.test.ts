import api from "@/lib/api"
import {
  fetchMembers,
  fetchEvents,
  fetchDashboardStats,
  fetchAnnouncements,
  fetchPrayerRequests,
  fetchDepartments,
  fetchAttendance,
  fetchUsers,
  fetchFinancialData,
  fetchBudgets,
  fetchBudgetSummary,
} from "@/lib/api-functions"

jest.mock("@/lib/api", () => ({
  get: jest.fn(),
}))

const mockedApi = api as jest.Mocked<typeof api>

beforeEach(() => {
  jest.clearAllMocks()
})

describe("fetchMembers", () => {
  it("calls api.get with /members and params", async () => {
    mockedApi.get.mockResolvedValue({ data: { members: [], total: 0 } })
    const params = { page: 1, size: 10, search: "John" }
    await fetchMembers(params)
    expect(mockedApi.get).toHaveBeenCalledWith("/members", { params })
  })

  it("calls api.get with empty params when none provided", async () => {
    mockedApi.get.mockResolvedValue({ data: { members: [], total: 0 } })
    await fetchMembers()
    expect(mockedApi.get).toHaveBeenCalledWith("/members", { params: undefined })
  })

  it("returns response data", async () => {
    const mockData = { members: [{ id: 1, firstName: "John" }], total: 1 }
    mockedApi.get.mockResolvedValue({ data: mockData })
    const result = await fetchMembers()
    expect(result).toEqual(mockData)
  })
})

describe("fetchEvents", () => {
  it("calls api.get with /events and params", async () => {
    mockedApi.get.mockResolvedValue({ data: { events: [] } })
    const params = { page: 1, size: 10 }
    await fetchEvents(params)
    expect(mockedApi.get).toHaveBeenCalledWith("/events", { params })
  })

  it("calls api.get with empty params when none provided", async () => {
    mockedApi.get.mockResolvedValue({ data: { events: [] } })
    await fetchEvents()
    expect(mockedApi.get).toHaveBeenCalledWith("/events", { params: undefined })
  })
})

describe("fetchDashboardStats", () => {
  it("calls Promise.all with 4 api calls", async () => {
    mockedApi.get.mockResolvedValue({ data: {} })
    await fetchDashboardStats()
    expect(mockedApi.get).toHaveBeenCalledTimes(4)
    expect(mockedApi.get).toHaveBeenCalledWith("/dashboard")
    expect(mockedApi.get).toHaveBeenCalledWith("/members/stats")
    expect(mockedApi.get).toHaveBeenCalledWith("/attendance/stats")
    expect(mockedApi.get).toHaveBeenCalledWith("/finance/summary")
  })

  it("returns aggregated stats", async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: { totalMembers: 100, activeMembers: 80 } })
      .mockResolvedValueOnce({ data: { totalMembers: 100, activeMembers: 80 } })
      .mockResolvedValueOnce({ data: { upcomingEvents: 5 } })
      .mockResolvedValueOnce({ data: { totalDonations: 1000 } })
    const result = await fetchDashboardStats()
    expect(result).toHaveProperty("totalMembers", 100)
    expect(result).toHaveProperty("activeMembers", 80)
    expect(result).toHaveProperty("totalDonations", 1000)
  })
})

describe("fetchAnnouncements", () => {
  it("calls api.get with /announcements", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchAnnouncements()
    expect(mockedApi.get).toHaveBeenCalledWith("/announcements")
  })
})

describe("fetchPrayerRequests", () => {
  it("calls api.get with /prayer-requests", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchPrayerRequests()
    expect(mockedApi.get).toHaveBeenCalledWith("/prayer-requests")
  })
})

describe("fetchDepartments", () => {
  it("calls api.get with /departments", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchDepartments()
    expect(mockedApi.get).toHaveBeenCalledWith("/departments")
  })
})

describe("fetchAttendance", () => {
  it("calls api.get with /attendance and date param", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchAttendance("2026-01-15")
    expect(mockedApi.get).toHaveBeenCalledWith("/attendance", { params: { date: "2026-01-15" } })
  })
  it("defaults to today when no date provided", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchAttendance()
    expect(mockedApi.get).toHaveBeenCalledWith("/attendance", { params: { date: expect.any(String) } })
  })
})

describe("fetchUsers", () => {
  it("calls api.get with /users", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchUsers()
    expect(mockedApi.get).toHaveBeenCalledWith("/users")
  })
})

describe("fetchFinancialData", () => {
  it("calls Promise.all with 4 api calls", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchFinancialData()
    expect(mockedApi.get).toHaveBeenCalledTimes(4)
    expect(mockedApi.get).toHaveBeenCalledWith("/finance/donations", { params: {} })
    expect(mockedApi.get).toHaveBeenCalledWith("/finance/tithes", { params: {} })
    expect(mockedApi.get).toHaveBeenCalledWith("/finance/offerings", { params: {} })
    expect(mockedApi.get).toHaveBeenCalledWith("/finance/expenses", { params: {} })
  })

  it("returns donations, tithes, offerings, and expenses", async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: [{ id: 1, amount: 100 }] })
      .mockResolvedValueOnce({ data: [{ id: 2, amount: 50 }] })
      .mockResolvedValueOnce({ data: [{ id: 3, amount: 75 }] })
      .mockResolvedValueOnce({ data: [{ id: 4, amount: 200 }] })
    const result = await fetchFinancialData()
    expect(result).toEqual({
      donations: [{ id: 1, amount: 100 }],
      tithes: [{ id: 2, amount: 50 }],
      offerings: [{ id: 3, amount: 75 }],
      expenses: [{ id: 4, amount: 200 }],
    })
  })

  it("passes date params when provided", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchFinancialData({ startDate: "2026-01-01", endDate: "2026-12-31" })
    expect(mockedApi.get).toHaveBeenCalledWith("/finance/donations", { params: { startDate: "2026-01-01", endDate: "2026-12-31" } })
  })

  it("defaults to empty array when data is null", async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({ data: null })
    const result = await fetchFinancialData()
    expect(result).toEqual({
      donations: [],
      tithes: [],
      offerings: [],
      expenses: [],
    })
  })
})

describe("fetchBudgets", () => {
  it("calls api.get with /budgets", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchBudgets()
    expect(mockedApi.get).toHaveBeenCalledWith("/budgets", { params: {} })
  })

  it("passes period param when provided", async () => {
    mockedApi.get.mockResolvedValue({ data: [] })
    await fetchBudgets("2026")
    expect(mockedApi.get).toHaveBeenCalledWith("/budgets", { params: { period: "2026" } })
  })
})

describe("fetchBudgetSummary", () => {
  it("calls api.get with /budgets/summary", async () => {
    mockedApi.get.mockResolvedValue({ data: {} })
    await fetchBudgetSummary("2026")
    expect(mockedApi.get).toHaveBeenCalledWith("/budgets/summary", { params: { period: "2026" } })
  })
})