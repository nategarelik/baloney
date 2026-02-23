// Test setup — globals, environment mocks

import { vi } from "vitest";

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SEED_SECRET = "test-seed-secret";
// NODE_ENV is read-only in TypeScript strict mode; vitest sets it automatically

// Mock console.error to keep test output clean (still tracks calls)
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "warn").mockImplementation(() => {});
