import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { installSovereignApi } from "./sovereignApi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "256kb" }));
  installSovereignApi(app);

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "stitch-sovereign-runtime", at: new Date().toISOString() });
  });

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Stitch sovereign runtime live on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
