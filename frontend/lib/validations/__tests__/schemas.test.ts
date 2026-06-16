import { loginSchema, registerSchema } from "../auth"
import { memberSchema, eventSchema, announcementSchema } from "../index"

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({ email: "test@church.com", password: "password" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password" })
    expect(result.success).toBe(false)
  })

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@church.com", password: "" })
    expect(result.success).toBe(false)
  })

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "password" })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  const validData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@church.com",
    password: "StrongPass1",
    confirmPassword: "StrongPass1",
  }

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: "Different1" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword")
    }
  })

  it("rejects weak password (no uppercase)", () => {
    const result = registerSchema.safeParse({ ...validData, password: "weakpass1", confirmPassword: "weakpass1" })
    expect(result.success).toBe(false)
  })

  it("rejects short password", () => {
    const result = registerSchema.safeParse({ ...validData, password: "Ab1", confirmPassword: "Ab1" })
    expect(result.success).toBe(false)
  })

  it("rejects missing first name", () => {
    const result = registerSchema.safeParse({ ...validData, firstName: "" })
    expect(result.success).toBe(false)
  })
})

describe("memberSchema", () => {
  it("accepts valid member data", () => {
    const result = memberSchema.safeParse({ firstName: "John", lastName: "Doe", email: "john@test.com" })
    expect(result.success).toBe(true)
  })

  it("rejects empty object (firstName, lastName, email required)", () => {
    const result = memberSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("accepts minimal data with required fields", () => {
    const result = memberSchema.safeParse({ firstName: "John", lastName: "Doe", email: "john@test.com" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = memberSchema.safeParse({ firstName: "John", lastName: "Doe", email: "invalid" })
    expect(result.success).toBe(false)
  })

  it("rejects first name over 50 chars", () => {
    const result = memberSchema.safeParse({ firstName: "A".repeat(51), lastName: "Doe", email: "a@test.com" })
    expect(result.success).toBe(false)
  })

  it("accepts valid gender enum", () => {
    const result = memberSchema.safeParse({ firstName: "John", lastName: "Doe", email: "a@test.com", gender: "MALE" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid gender", () => {
    const result = memberSchema.safeParse({ firstName: "John", lastName: "Doe", email: "a@test.com", gender: "INVALID" })
    expect(result.success).toBe(false)
  })
})

describe("eventSchema", () => {
  it("accepts valid event data", () => {
    const result = eventSchema.safeParse({ title: "Sunday Service", startTime: "2024-01-01T10:00:00" })
    expect(result.success).toBe(true)
  })

  it("rejects empty title", () => {
    const result = eventSchema.safeParse({ title: "", startTime: "2024-01-01T10:00:00" })
    expect(result.success).toBe(false)
  })

  it("rejects missing startTime", () => {
    const result = eventSchema.safeParse({ title: "Service" })
    expect(result.success).toBe(false)
  })

  it("accepts valid recurring pattern", () => {
    const result = eventSchema.safeParse({ title: "Service", startTime: "2024-01-01T10:00:00", recurringPattern: "WEEKLY" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid recurring pattern", () => {
    const result = eventSchema.safeParse({ title: "Service", startTime: "2024-01-01T10:00:00", recurringPattern: "DAILY" })
    expect(result.success).toBe(false)
  })

  it("accepts maxAttendees as positive integer", () => {
    const result = eventSchema.safeParse({ title: "Service", startTime: "2024-01-01T10:00:00", maxAttendees: 100 })
    expect(result.success).toBe(true)
  })
})

describe("announcementSchema", () => {
  it("accepts valid announcement data", () => {
    const result = announcementSchema.safeParse({ title: "Notice", content: "Important update" })
    expect(result.success).toBe(true)
  })

  it("rejects empty title", () => {
    const result = announcementSchema.safeParse({ title: "", content: "Body" })
    expect(result.success).toBe(false)
  })

  it("rejects empty content", () => {
    const result = announcementSchema.safeParse({ title: "Notice", content: "" })
    expect(result.success).toBe(false)
  })

  it("rejects missing content", () => {
    const result = announcementSchema.safeParse({ title: "Notice" })
    expect(result.success).toBe(false)
  })

  it("accepts valid priority", () => {
    const result = announcementSchema.safeParse({ title: "Notice", content: "Body", priority: "HIGH" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid priority", () => {
    const result = announcementSchema.safeParse({ title: "Notice", content: "Body", priority: "CRITICAL" })
    expect(result.success).toBe(false)
  })

  it("accepts valid targetAudience", () => {
    const result = announcementSchema.safeParse({ title: "Notice", content: "Body", targetAudience: "LEADERS" })
    expect(result.success).toBe(true)
  })
})