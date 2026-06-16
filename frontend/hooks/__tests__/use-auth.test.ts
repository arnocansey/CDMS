import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";

jest.mock("@/lib/api", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

beforeEach(() => {
  useAuth.setState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
});

describe("useAuth Hook", () => {
  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should set user via setUser", () => {
    const { result } = renderHook(() => useAuth());
    const mockUser = { id: 1, email: "test@test.com", firstName: "A", lastName: "B", roles: [] };
    act(() => {
      result.current.setUser(mockUser);
    });
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should clear user via setUser with null", () => {
    const { result } = renderHook(() => useAuth());
    const mockUser = { id: 1, email: "test@test.com", firstName: "A", lastName: "B", roles: [] };
    act(() => {
      result.current.setUser(mockUser);
    });
    expect(result.current.isAuthenticated).toBe(true);
    act(() => {
      result.current.setUser(null);
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should have login function", () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.login).toBe("function");
  });

  it("should have register function", () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.register).toBe("function");
  });

  it("should have logout function", () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.logout).toBe("function");
  });
});
