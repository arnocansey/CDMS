export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  membershipDate?: string;
  baptismDate?: string;
  photoUrl?: string;
  active: boolean;
  departmentId?: number;
  departmentName?: string;
}

export interface Attendance {
  id: number;
  memberId: number;
  memberName: string;
  serviceDate: string;
  serviceType: string;
  present: boolean;
  checkInTime?: string;
}

export interface Donation {
  id: number;
  memberId?: number;
  memberName?: string;
  amount: number;
  category: string;
  description?: string;
  donationDate: string;
  paymentMethod?: string;
}

export interface Tithe {
  id: number;
  memberId: number;
  memberName: string;
  amount: number;
  titheDate: string;
  paymentMethod?: string;
}

export interface Offering {
  id: number;
  serviceDate: string;
  serviceType: string;
  amount: number;
  offeringType?: string;
  description?: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  description?: string;
  expenseDate: string;
  paymentMethod?: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  recurring: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  publishDate?: string;
  expiryDate?: string;
  published: boolean;
}

export interface PrayerRequest {
  id: number;
  memberId?: number;
  memberName?: string;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED";
  anonymous: boolean;
  prayedBy?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  leaderId?: number;
  leaderName?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardData {
  totalMembers: number;
  activeMembers: number;
  attendanceToday: number;
  totalDonations: number;
  totalExpenses: number;
  netBalance: number;
  upcomingEvents: number;
  pendingPrayerRequests: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}
