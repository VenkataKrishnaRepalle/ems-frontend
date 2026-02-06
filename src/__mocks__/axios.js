const mockAxiosInstance = {
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

const axios = {
  create: jest.fn(() => mockAxiosInstance),
};

module.exports = {
  __esModule: true,
  default: axios,
  ...axios,
};

