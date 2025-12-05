import express from "express";
import cors from "cors";
import axios from "axios";
import serverless from "serverless-http";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint TikTok Downloader
app.get("/api/tiktok", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL TikTok diperlukan",
      });
    }

    // Request ke API TikTok Downloader
    const response = await axios.get("https://tikwm.com/api/", {
      params: {
        url: url,
        hd: 1,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
        Referer: "https://tikwm.com/",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error TikTok:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data dari API",
      error: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Serverless Express running!" });
});

// Wajib: export handler ke Vercel
export const handler = serverless(app);
export default handler;
