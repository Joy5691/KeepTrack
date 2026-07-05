import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API constraints
  let ai: GoogleGenAI | null = null;
  function getAI() {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY environment variable is missing.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
  }

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/insights", async (req, res) => {
    try {
      const { transactions, goals, budgets } = req.body;
      
      const genAI = getAI();
      const prompt = `
        You are an intelligent, empathetic financial AI assistant. 
        Analyze the user's financial data and provide 3 short, actionable, and emotional insights.
        Keep it human and engaging. 
        Examples: "You spent 20% more on food this month.", "Your savings are improving. Keep it up!", "Careful! Shopping expenses increased."
        Format the response as a JSON array of strings. Maximum 3 insights.
        
        Data:
        Transactions: ${JSON.stringify(transactions)}
        Goals: ${JSON.stringify(goals)}
        Budgets: ${JSON.stringify(budgets)}
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
      });
      
      let text = response.text;
      if (!text) {
          throw new Error("No text returned from Gemini");
      }
      
      const parsed = JSON.parse(text);
      res.json({ insights: parsed });
    } catch (err: any) {
      const errStr = String(err.message || "") + " " + JSON.stringify(err, Object.getOwnPropertyNames(err));
      
      if (errStr.includes("429") || errStr.includes("Quota") || errStr.includes("RESOURCE_EXHAUSTED")) {
          console.warn("AI Insight rate limited (429). Providing fallback.");
          return res.json({ 
              insights: [
                  "Hmm, it looks like my AI analysis engine is currently taking a quick break due to rate limits.",
                  "While I recharge, I recommend keeping an eye on your recent expenses and balancing your budget.",
                  "Try asking me for insights again a little later!"
              ] 
          });
      }

      console.error("AI Insight Error:", err.message);
      res.status(500).json({ error: err.message || "Failed to generate insights" });
    }
  });


  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In Express v4, it is `*`. Express v5 would be `*all`.
    // Express 4.21.2 is installed based on package.json.
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
