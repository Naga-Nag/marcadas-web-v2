// Mock database module to prevent Bun.env access during tests
export const connection = {
  connect: vi.fn().mockResolvedValue(undefined),
  request: vi.fn(() => ({
    input: vi.fn().mockReturnThis(),
    arrayRowMode: true,
    query: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    stream: false
  }))
};

export const processRow = vi.fn();