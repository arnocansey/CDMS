import api from "@/lib/api";

export interface Church {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  pastorName: string;
  memberCount: number;
  latitude: number;
  longitude: number;
}

export const directoryApi = {
  search: (query: string) => api.get<Church[]>(`/approvals/churches/search`, { params: { query } }),
  getPublic: (churchId: number) => api.get<Church>(`/church-settings/public/${churchId}`),
};
