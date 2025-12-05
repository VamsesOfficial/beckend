import express from "express";
import cors from "cors";
import axios from "axios";
import serverless from "serverless-http";

const app = express();

app.use(cors());
app.use(express.json());

// IMPORTANT: jangan pakai /api di sini
app.get("/tiktok", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL TikTok diperlukan"
      });
    }

    const response = await axios.get("https://tikwm.com/api/", {
      params: {
        url,
        hd: 1
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
        Referer: "https://tikwm.com/"
      }
    });

    return res.json(response.data);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data dari API",
      error: err.message
    });
  }
});

// WAJIB untuk serverless vercel
export const handler = serverless(app);
export default handler;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data dari API",
      error: err.message,
    });
  }
});

// WAJIB
export const handler = serverless(app);
export default handler;

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
