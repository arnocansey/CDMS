import { z } from "zod"

export const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  baptismDate: z.string().optional(),
  membershipDate: z.string().optional(),
  photoUrl: z.string().optional(),
  active: z.boolean().optional(),
  departmentId: z.number().optional(),
  branchId: z.number().optional(),
  districtId: z.number().optional(),
})

export type MemberFormData = z.infer<typeof memberSchema>

export const eventSchema = z.object({
  title: z.string().min(1, "Event title is required").max(200),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  location: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"]).optional(),
  maxAttendees: z.number().int().positive().optional(),
})

export type EventFormData = z.infer<typeof eventSchema>

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  expiresAt: z.string().optional(),
  targetAudience: z.enum(["ALL", "MEMBERS", "LEADERS", "PASTORS"]).optional(),
})

export type AnnouncementFormData = z.infer<typeof announcementSchema>

export const donationSchema = z.object({
  memberId: z.number().optional(),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(["GENERAL", "BUILDING_FUND", "WELFARE", "SPECIAL"], {
    required_error: "Category is required",
  }),
  description: z.string().optional(),
  donationDate: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "CARD", "MOBILE"]).optional(),
  referenceNumber: z.string().optional(),
  branchId: z.number().optional(),
})

export type DonationFormData = z.infer<typeof donationSchema>

export const titheSchema = z.object({
  memberId: z.number({ required_error: "Member is required" }),
  amount: z.number().positive("Amount must be positive"),
  titheDate: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "CARD", "MOBILE"]).optional(),
  referenceNumber: z.string().optional(),
  branchId: z.number().optional(),
})

export type TitheFormData = z.infer<typeof titheSchema>

export const offeringSchema = z.object({
  serviceDate: z.string().min(1, "Date is required"),
  serviceType: z.enum(["SUNDAY", "WEDNESDAY", "FRIDAY", "SPECIAL", "OTHER"], {
    required_error: "Service type is required",
  }),
  amount: z.number().positive("Amount must be positive"),
  offeringType: z.enum(["GENERAL", "THANKSGIVING", "SEED", "MISCELLANEOUS"]).optional(),
  description: z.string().optional(),
  branchId: z.number().optional(),
})

export type OfferingFormData = z.infer<typeof offeringSchema>

export const expenseSchema = z.object({
  category: z.enum([
    "UTILITIES", "SALARIES", "EVANGELISM", "MAINTENANCE",
    "EQUIPMENT", "TRANSPORTATION", "WELFARE", "MISCELLANEOUS",
  ], { required_error: "Category is required" }),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  expenseDate: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "CARD", "MOBILE"]).optional(),
  approvedBy: z.string().optional(),
  branchId: z.number().optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>

export const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required").max(200),
  category: z.enum([
    "UTILITIES", "SALARIES", "EVANGELISM", "MAINTENANCE",
    "EQUIPMENT", "TRANSPORTATION", "WELFARE", "MISCELLANEOUS",
  ], { required_error: "Category is required" }),
  amount: z.number().positive("Amount must be positive"),
  period: z.string().min(1, "Period is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.number().optional(),
})

export type BudgetFormData = z.infer<typeof budgetSchema>

export const fundSchema = z.object({
  name: z.string().min(1, "Fund name is required").max(100),
  description: z.string().optional(),
  fundType: z.enum(["GENERAL", "BUILDING", "WELFARE", "MISSION", "YOUTH", "PROJECT"], {
    required_error: "Fund type is required",
  }),
  openingBalance: z.number().min(0).optional(),
  targetAmount: z.number().positive().optional(),
})

export type FundFormData = z.infer<typeof fundSchema>

export const fundTransactionSchema = z.object({
  fundId: z.number({ required_error: "Fund is required" }),
  transactionType: z.enum(["INCOME", "EXPENSE", "TRANSFER"], {
    required_error: "Transaction type is required",
  }),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
  transactionDate: z.string().min(1, "Date is required"),
})

export type FundTransactionFormData = z.infer<typeof fundTransactionSchema>

export const pledgeSchema = z.object({
  memberId: z.number({ required_error: "Member is required" }),
  pledgeType: z.string().min(1, "Pledge type is required"),
  description: z.string().optional(),
  pledgeAmount: z.number().positive("Amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
  frequency: z.enum(["ONE_TIME", "WEEKLY", "MONTHLY", "QUARTERLY", "ANNUAL"]).optional(),
})

export type PledgeFormData = z.infer<typeof pledgeSchema>

export const pledgePaymentSchema = z.object({
  pledgeId: z.number({ required_error: "Pledge is required" }),
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "CARD", "MOBILE"]).optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})

export type PledgePaymentFormData = z.infer<typeof pledgePaymentSchema>

export const financialGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(200),
  description: z.string().optional(),
  targetAmount: z.number().positive("Target amount must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  category: z.enum(["BUILDING", "VEHICLE", "MISSION", "WELFARE", "EQUIPMENT", "OTHER"]).optional(),
})

export type FinancialGoalFormData = z.infer<typeof financialGoalSchema>

export const goalContributionSchema = z.object({
  goalId: z.number({ required_error: "Goal is required" }),
  memberId: z.number().optional(),
  amount: z.number().positive("Amount must be positive"),
  contributionDate: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "CARD", "MOBILE"]).optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})

export type GoalContributionFormData = z.infer<typeof goalContributionSchema>

export const cashFlowEntrySchema = z.object({
  entryDate: z.string().min(1, "Date is required"),
  entryType: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Entry type is required",
  }),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  referenceNumber: z.string().optional(),
  source: z.string().optional(),
})

export type CashFlowEntryFormData = z.infer<typeof cashFlowEntrySchema>
