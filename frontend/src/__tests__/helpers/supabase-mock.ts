// Chainable Supabase query builder mock
// Mimics the supabase.from('table').select().eq().order() pattern

import { vi } from "vitest";

interface MockQueryResult {
  data: unknown;
  error: null | { message: string };
  count?: number;
}

export function createSupabaseMock(defaultResult: MockQueryResult = { data: [], error: null }) {
  let result = { ...defaultResult };

  const chainable = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
    then: vi.fn((resolve) => resolve(result)),
  };

  // Make chainable methods resolve to the result when awaited
  const proxy = new Proxy(chainable, {
    get(target, prop) {
      if (prop === "then") {
        return (resolve: (value: MockQueryResult) => void) => resolve(result);
      }
      return target[prop as keyof typeof target];
    },
  });

  const supabase = {
    from: vi.fn().mockReturnValue(proxy),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
    _setResult(newResult: MockQueryResult) {
      result = { ...newResult };
      chainable.single.mockResolvedValue(result);
    },
  };

  return supabase;
}
