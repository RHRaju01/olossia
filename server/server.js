import dotenv from "dotenv";
import app from "./app.js";
import { testConnection } from "../server/config/database.js";
import RefreshToken from "./models/RefreshToken.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

export const startServer = async (portOverride) => {
  try {
    await testConnection();
    const listenPort =
      typeof portOverride === "number" && portOverride >= 0
        ? portOverride
        : PORT;
    const server = app.listen(listenPort, () => {
      const addr = server.address();
      const actualPort = addr && addr.port ? addr.port : listenPort;
      console.log(`🚀 Server running on port ${actualPort}`);
    });

    // Schedule pruning and attach job id for cleanup in tests
    const pruneInterval = parseInt(
      process.env.PRUNE_INTERVAL_MS || String(1000 * 60 * 60),
      10
    );
    const pruneJob = setInterval(async () => {
      try {
        await RefreshToken.pruneExpired();
        console.log("🧹 Pruned expired refresh tokens");
      } catch (e) {
        console.warn("Prune job error:", e.message || e);
      }
    }, pruneInterval);

    // attach for test cleanup
    server.pruneJob = pruneJob;
    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    throw error;
  }
};

// If started directly, run startServer
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  startServer().catch(() => process.exit(1));
}
