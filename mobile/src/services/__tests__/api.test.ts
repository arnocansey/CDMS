jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    defaults: { headers: { common: {} } },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
      post: jest.fn(),
    },
  };
});

import api from '../api';

describe('api service', () => {
  it('exports a default axios instance with interceptors registered', () => {
    expect(api).toBeDefined();
    expect(api.interceptors).toBeDefined();
    expect(api.interceptors.request.use).toHaveBeenCalled();
    expect(api.interceptors.response.use).toHaveBeenCalled();
  });
});
