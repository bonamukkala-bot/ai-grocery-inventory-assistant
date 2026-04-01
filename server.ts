import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "inventory-ai-backend" });
});

app.post("/api/analyze", (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "A list of items is required." });
  }

  const results = items.map((item: any) => {
    const { name, stock, sales, unit } = item;
    if (!name || stock === undefined || !sales || !Array.isArray(sales) || sales.length === 0) {
      return { name: name || "Unknown", error: "Invalid data" };
    }
    const sumSales = sales.reduce((a: number, b: number) => a + b, 0);
    const avgSales = sumSales / sales.length;
    const effectiveAvgSales = avgSales || 0.1;
    const daysLeft = stock / effectiveAvgSales;
    const reorder = avgSales * 7;

    let status = "Healthy";
    if (daysLeft < 3) status = "Critical";
    else if (daysLeft <= 7) status = "Low";

    return {
      name, stock, unit: unit || "units",
      avg_sales: parseFloat(avgSales.toFixed(2)),
      days_left: parseFloat(daysLeft.toFixed(2)),
      reorder: Math.ceil(reorder),
      status
    };
  });

  res.json(results.filter((r: any) => !r.error).sort((a: any, b: any) => a.days_left - b.days_left));
});

async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
export default app;