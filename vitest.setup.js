// Load environment variables so server-side modules that read process.env work in tests
import dotenv from "dotenv";
import path from "path";

// Prefer server/.env if present
dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });

// Provide a minimal jest shim used by some server tests (they call jest.setTimeout).
// Vitest exposes `vi` globally; we map the commonly-used jest APIs to vi equivalents.
if (typeof globalThis.jest === "undefined") {
  // eslint-disable-next-line no-global-assign
  globalThis.jest = {
    setTimeout: (ms) => {
      if (typeof globalThis.vi !== "undefined" && vi.setTimeout) {
        return vi.setTimeout(ms);
      }
      // fallback: no-op
      return undefined;
    },
  };
}

// Install jest-dom matchers
import "@testing-library/jest-dom";
