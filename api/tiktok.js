// File: api/tiktok.js
// GANTI SEMUA ISI FILE api/tiktok.js ANDA DENGAN CODE INI
// Format: Vercel Serverless Function (tanpa Express)

import axios from "axios";

export default async function handler(req, res) {
  // ========================
  // 🔒 SECURITY CHECK - API KEY
  // ========================
  const apiKey = req.headers['celakgede'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      code: -1,
      message: "🔒 API Key diperlukan. Tambahkan x-api-key di header request."
    });
  }
  
  if (apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({
      success: false,
      code: -1,
      message: "🔒 API Key tidak valid!"
    });
  }
  
  // ========================
  // 🌐 CORS HEADERS
  // ========================
  const allowedOrigins = [
    'https://beckend-black.vercel.app'
  ];
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // ========================
  // 📍 HANYA ACCEPT GET REQUEST
  // ========================
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      code: -1,
      message: "Method not allowed. Only GET is supported."
    });
  }
  
  // ========================
  // ✅ API LOGIC - TIKTOK DOWNLOADER
  // ========================
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        code: -1,
        message: "URL TikTok diperlukan"
      });
    }

    // Validasi URL TikTok
    if (!url.includes("tiktok.com")) {
      return res.status(400).json({
        success: false,
        code: -1,
        message: "URL harus dari TikTok"
      });
    }

    // Fetch data dari TikWM API
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
      },
      timeout: 30000 // 30 detik timeout
    });

    return res.status(200).json(response.data);
    
  } catch (err) {
    console.error("TikTok API Error:", err.message);
    
    return res.status(500).json({
      success: false,
      code: -1,
      message: "Gagal mengambil data dari API",
      error: err.message
    });
  }
}

// ========================
// 📝 CATATAN DEPLOYMENT:
// ========================
// 
// 1. File ini akan otomatis menjadi endpoint: /api/tiktok
// 2. Pastikan sudah setup environment variable di Vercel:
//    - Name: API_SECRET_KEY
//    - Value: your-secret-key-here
//
// 3. Test endpoint:
//    ❌ Tanpa API key: https://beckend-black.vercel.app/api/tiktok?url=...
//       Result: 401 Unauthorized
//    
//    ✅ Dengan API key di header:
//       Headers: { 'x-api-key': 'your-secret-key-here' }
//       Result: Success
//
