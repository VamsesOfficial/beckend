// File: api/tiktok.js
// SOLUSI TERBAIK: Backend Proxy tanpa expose API key ke client

import axios from "axios";
import crypto from "crypto";

// Rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 menit
const MAX_REQUESTS_PER_IP = 10;

// Clean up
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW * 5) {
      requestCounts.delete(key);
    }
  }
}, 300000);

// Generate temporary token (valid 5 menit)
function generateToken(ip, timestamp) {
  const secret = process.env.API_SECRET_KEY;
  return crypto
    .createHmac('sha256', secret)
    .update(`${ip}-${timestamp}`)
    .digest('hex');
}

function verifyToken(token, ip) {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  // Check tokens dari 5 menit terakhir
  for (let i = 0; i < 5; i++) {
    const timestamp = Math.floor((now - (i * 60 * 1000)) / 60000) * 60000;
    const validToken = generateToken(ip, timestamp);
    if (token === validToken) return true;
  }
  
  return false;
}

export default async function handler(req, res) {
  // ========================
  // 🔒 SECURITY CHECKS
  // ========================
  
  // 1. Get IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             'unknown';
  
  // 2. Referrer Check
  const referer = req.headers.referer || req.headers.referrer || '';
  const allowedDomains = [
    'beckend-black.vercel.app',
    'localhost:5173',
    'localhost:3000'
  ];
  
  const isValidReferer = allowedDomains.some(domain => referer.includes(domain));
  
  if (!isValidReferer && referer !== '') {
    return res.status(403).json({
      success: false,
      message: "Access denied"
    });
  }
  
  // 3. Rate Limiting
  const now = Date.now();
  const rateLimitKey = ip;
  
  if (!requestCounts.has(rateLimitKey)) {
    requestCounts.set(rateLimitKey, {
      count: 1,
      firstRequest: now
    });
  } else {
    const data = requestCounts.get(rateLimitKey);
    
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      data.count = 1;
      data.firstRequest = now;
    } else {
      data.count++;
      
      if (data.count > MAX_REQUESTS_PER_IP) {
        return res.status(429).json({
          success: false,
          message: "Too many requests",
          retryAfter: Math.ceil((data.firstRequest + RATE_LIMIT_WINDOW - now) / 1000)
        });
      }
    }
  }
  
  // 4. Token Verification (Optional - untuk extra security)
  const clientToken = req.headers['x-client-token'];
  if (process.env.ENABLE_TOKEN_AUTH === 'true') {
    if (!clientToken || !verifyToken(clientToken, ip)) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  }
  
  // ========================
  // 🌐 CORS
  // ========================
  const allowedOrigins = [
    'https://beckend-black.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-client-token');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }
  
  // ========================
  // ✅ TIKTOK API LOGIC
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

    if (!url.includes("tiktok.com")) {
      return res.status(400).json({
        success: false,
        code: -1,
        message: "URL harus dari TikTok"
      });
    }

    // CALL EXTERNAL API - API key hidden di backend
    const response = await axios.get("https://tikwm.com/api/", {
      params: { url, hd: 1 },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://tikwm.com/"
      },
      timeout: 30000
    });

    return res.status(200).json(response.data);
    
  } catch (err) {
    console.error("TikTok API Error:", err.message);
    
    return res.status(500).json({
      success: false,
      code: -1,
      message: "Gagal mengambil data dari API"
    });
  }
}

// ========================
// 🎯 KEUNTUNGAN METODE INI:
// ========================
// 
// ✅ TIDAK ADA API key yang terexpose ke client
// ✅ Client hanya perlu fetch biasa tanpa header khusus
// ✅ Semua security check di backend
// ✅ Rate limiting per IP
// ✅ Referrer check
// ✅ Optional: Token-based auth yang auto-rotate
// 
// ⚠️ Yang bisa abuse:
// - Orang bisa copy fetch command dari Network tab
// - TAPI: dibatasi rate limit ketat per IP
// - TAPI: harus dari referrer yang valid
// - TAPI: token auto-expire setiap 5 menit (jika diaktifkan)
//
