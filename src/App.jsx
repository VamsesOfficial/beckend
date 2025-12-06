// File: src/App.jsx
// UPDATE BAGIAN fetchData SAJA, sisanya tetap sama

import React, { useState, useEffect, useRef } from "react";
import { Download, Video, Loader2, AlertCircle, Music, Share2, Instagram, Mail, Code } from "lucide-react";

// ========================
// 🔑 API CONFIGURATION
// ========================
// PENTING: Simpan API_KEY ini di .env untuk production!
// File .env: VITE_API_KEY=rahasia-anda-12345
// Lalu ganti baris ini dengan: const API_KEY = import.meta.env.VITE_API_KEY;

const API_KEY = "celakgede"; // Ganti dengan API key yang sama di Vercel
const API_URL = "https://beckend-black.vercel.app/api/tiktok";

export default function TikTokDownloader() {
  // ============================
  //  MAIN STATES
  // ============================
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // ============================
  //  AUTO SLIDE
  // ============================
  const [autoSlide, setAutoSlide] = useState(true);
  const autoTimer = useRef(null);
  const resumeTimer = useRef(null);

  const stopAutoSlide = () => {
    if (autoTimer.current) clearInterval(autoTimer.current);
  };

  const startAutoSlide = () => {
    if (!autoSlide) return;
    stopAutoSlide();

    autoTimer.current = setInterval(() => {
      setIndex((prev) => {
        if (!result?.images) return prev;
        return (prev + 1) % result.images.length;
      });
    }, 3000);
  };

  useEffect(() => {
    if (result?.images?.length > 1) startAutoSlide();
    return () => stopAutoSlide();
  }, [result, autoSlide]);

  // ============================
  //  TOUCH GESTURE
  // ============================
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    stopAutoSlide();
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (!result?.images) return;

    if (diff > 50) {
      setIndex((i) => (i + 1) % result.images.length);
    } else if (diff < -50) {
      setIndex((i) => (i === 0 ? result.images.length - 1 : i - 1));
    }

    resumeTimer.current = setTimeout(() => {
      startAutoSlide();
    }, 5000);
  };

  const goToSlide = (i) => {
    setIndex(i);
    stopAutoSlide();
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      startAutoSlide();
    }, 5000);
  };

  // ============================
  //  PASTE FUNCTION (WEB)
  // ============================
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      setError("Gagal membaca clipboard. Pastikan izin diberikan.");
    }
  };

  // ============================
  //  FORMAT HELPERS
  // ============================
  const formatNumber = (n) => {
    if (!n) return 0;
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n;
  };

  const formatDate = (unix) => {
    if (!unix) return "-";
    try {
      return new Date(unix * 1000).toLocaleString();
    } catch {
      return "-";
    }
  };

  // ============================
  //  DOWNLOAD FUNCTIONS
  // ============================
  const forceDownload = async (fileUrl, filename) => {
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);

      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch (err) {
      console.log(err);
      setError("Gagal mengunduh file. Coba buka link di browser.");
    }
  };

  const downloadVideo = async (hd = false) => {
    const file = hd ? result.hdplay : result.play;
    const name = (result.title || "video").replace(/\s+/g, "_");
    await forceDownload(file, `${name}${hd ? "_HD" : ""}.mp4`);
  };

  const downloadImage = async (img, i) => {
    const extMatch = img.match(/\.(jpg|jpeg|png|webp|gif)/i);
    const ext = extMatch ? extMatch[0] : ".jpg";
    const name = (result.title || "image").replace(/\s+/g, "_");
    await forceDownload(img, `${name}_${i + 1}${ext}`);
  };

  const downloadMusic = async () => {
    const music = result.music || result.music_info?.play;
    const title = (result.music_info?.title || "music").replace(/\s+/g, "_");
    await forceDownload(music, `${title}.mp3`);
  };

  // ============================
  //  SHARE FUNCTION
  // ============================
  const shareContent = async (fileUrl, type) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'TikTok Content',
          text: 'Check this out from TikTok!',
          url: fileUrl
        });
      } else {
        await navigator.clipboard.writeText(fileUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  // ============================
  //  🔒 FETCH DATA (UPDATED WITH API KEY)
  // ============================
  const fetchData = async () => {
    if (!url.trim()) {
      setError("URL tidak boleh kosong!");
      return;
    }
    if (!url.includes("tiktok.com")) {
      setError("Masukkan URL TikTok yang valid!");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setIndex(0);

    try {
      // 🔑 KIRIM REQUEST DENGAN API KEY
      const res = await fetch(`${API_URL}?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY  // 👈 INI YANG PENTING!
        }
      });

      const json = await res.json();

      // Handle error dari API
      if (!res.ok) {
        setError(json.message || "Gagal mengambil data dari API");
        setLoading(false);
        return;
      }

      if (json.code !== 0) {
        setError(json.msg || json.message || "API Error.");
        setLoading(false);
        return;
      }

      setResult(json.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal terhubung ke server. Pastikan koneksi internet Anda stabil.");
    }

    setLoading(false);
  };

  // ============================
  //  RENDER (SISANYA SAMA PERSIS)
  // ============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-full mb-4 shadow-lg">
            <Video className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            TikTok Downloader Pro
          </h1>
          <p className="text-pink-200 text-lg">
            Download Video / Foto Slide / Musik tanpa watermark
          </p>
          <p className="text-sm mt-2 text-white/70">
            ✨ Universal App - Android, iOS & Web
          </p>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="mt-4 px-6 py-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition mx-auto shadow-lg"
          >
            <AlertCircle className="w-5 h-5" />
            Info & Cara Pakai
          </button>
        </div>

        {/* INFO PANEL */}
        {showInfo && (
          <div className="mb-6 p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md text-white border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Informasi & Cara Pakai
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">📱 Platform Support:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><b>Android:</b> Install via APK atau Play Store (jika dipublish)</li>
                  <li><b>iOS:</b> Install via TestFlight atau App Store (jika dipublish)</li>
                  <li><b>Web:</b> Akses langsung via browser (Chrome, Safari, Firefox)</li>
                  <li><b>Desktop:</b> Bisa diakses via browser atau PWA</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">📖 Cara Penggunaan:</h3>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Buka aplikasi TikTok dan pilih video/foto yang ingin diunduh</li>
                  <li>Klik tombol "Bagikan" (Share) pada video tersebut</li>
                  <li>Pilih "Salin Tautan" (Copy Link)</li>
                  <li>Kembali ke aplikasi ini dan klik "Paste" atau tempel manual</li>
                  <li>Klik tombol "Download" untuk mengambil data</li>
                  <li>Pilih format yang diinginkan (SD/HD/Foto/Music)</li>
                </ol>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">✨ Fitur Utama:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>✅ Download video tanpa watermark (SD & HD)</li>
                  <li>✅ Download foto slide dengan preview carousel</li>
                  <li>✅ Download musik/audio dari video</li>
                  <li>✅ Auto-slide untuk foto dengan kontrol manual</li>
                  <li>✅ Swipe gesture untuk navigasi foto</li>
                  <li>✅ Share content ke aplikasi lain</li>
                  <li>✅ Responsive design untuk semua device</li>
                  <li>✅ Informasi lengkap (views, likes, comments)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">⚠️ Catatan Penting:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Gunakan untuk keperluan pribadi dan edukasi</li>
                  <li>Hormati hak cipta pembuat konten</li>
                  <li>Beberapa video mungkin tidak bisa diunduh karena pembatasan</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-2.5 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition shadow-lg"
            >
              Tutup
            </button>
          </div>
        )}

        {/* INPUT BOX */}
        <div className="p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-6">
          <label className="font-semibold text-white text-lg">
            URL TikTok
          </label>
          <div className="relative mt-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              className="w-full px-4 py-3 pr-24 rounded-lg bg-white/20 border-white/30 text-white placeholder-gray-300 border focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
              placeholder="https://www.tiktok.com/@user/video/..."
            />
            <button
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-semibold transition bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              Paste
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 transition shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Download className="w-6 h-6" />
            )}
            {loading ? "Mengambil data..." : "Download"}
          </button>

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/40 p-4 rounded-lg text-red-100 flex gap-2 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* RESULT */}
        {result && (
          <div className="p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 space-y-6">
            {/* INFO */}
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-3">Informasi Post</h3>
              <p className="break-words"><b>Title:</b> <span className="break-all">{result.title}</span></p>
              <p className="truncate"><b>Author:</b> {result.author?.nickname}</p>
              <p><b>Plays:</b> {formatNumber(result.play_count)}</p>
              <p><b>Likes:</b> {formatNumber(result.digg_count)}</p>
              <p><b>Comments:</b> {formatNumber(result.comment_count)}</p>
              <p><b>Shares:</b> {formatNumber(result.share_count)}</p>
              <p><b>Created:</b> {formatDate(result.create_time)}</p>
            </div>

            {/* PREVIEW */}
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <h3 className="font-bold text-xl mb-4">Preview</h3>

              {/* FOTO SLIDE */}
              {Array.isArray(result.images) && result.images.length > 0 ? (
                <div className="w-full">
                  <div
                    className="w-full overflow-hidden rounded-xl mb-4 relative shadow-xl"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="relative w-full" style={{ aspectRatio: "9/16" }}>
                      {result.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Slide ${i + 1}`}
                          className={`absolute top-0 left-0 w-full h-full rounded-xl object-cover transition-all duration-500 ease-in-out ${
                            i === index
                              ? "opacity-100 translate-x-0"
                              : i < index
                              ? "opacity-0 -translate-x-full"
                              : "opacity-0 translate-x-full"
                          }`}
                          style={{
                            transform: i === index ? "translateX(0)" : 
                                      i < index ? "translateX(-100%)" : "translateX(100%)"
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* DOTS */}
                  <div className="flex justify-center gap-2 mb-4 flex-wrap">
                    {result.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          i === index
                            ? "bg-pink-500 scale-125"
                            : "bg-gray-400 scale-100 hover:bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* AUTO SLIDE TOGGLE */}
                  <button
                    onClick={() => setAutoSlide(!autoSlide)}
                    className="px-4 py-2 rounded-lg bg-pink-600 text-white font-semibold mx-auto block mb-4 hover:bg-pink-700 transition shadow-lg"
                  >
                    Auto Slide: {autoSlide ? "ON" : "OFF"}
                  </button>

                  {/* DOWNLOAD & SHARE BUTTONS */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadImage(result.images[index], index)}
                      className="flex-1 py-3 bg-pink-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-pink-700 transition shadow-lg"
                    >
                      <Download className="w-6 h-6" />
                      Download Foto {index + 1}
                    </button>
                    <button
                      onClick={() => shareContent(result.images[index], 'image')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-blue-700 transition shadow-lg"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                /* VIDEO */
                <div className="w-full">
                  <video
                    src={result.play || result.hdplay}
                    className="w-full rounded-xl mb-4 shadow-xl"
                    controls
                    playsInline
                    preload="metadata"
                  />

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => downloadVideo(false)}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-blue-700 transition shadow-lg"
                      >
                        <Download className="w-6 h-6" />
                        Download SD
                      </button>
                      <button
                        onClick={() => shareContent(result.play, 'video')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-indigo-700 transition shadow-lg"
                      >
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>

                    {result.hdplay && (
                      <button
                        onClick={() => downloadVideo(true)}
                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-green-700 transition shadow-lg"
                      >
                        <Download className="w-6 h-6" />
                        Download HD
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* MUSIC */}
            <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Music />
                Music
              </h3>

              <p className="truncate"><b>Judul:</b> {result.music_info?.title || "-"}</p>
              <p className="truncate"><b>Artist:</b> {result.music_info?.author || "-"}</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={downloadMusic}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-indigo-700 transition shadow-lg"
                >
                  <Download className="w-6 h-6" />
                  Download Music
                </button>
                <button
                  onClick={() => shareContent(result.music_info?.play, 'music')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-purple-700 transition shadow-lg"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEVELOPER INFO */}
        <div className="mt-8 p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-6 h-6 text-pink-400" />
            <h3 className="text-xl font-bold">Informasi Pengembang</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center font-bold text-lg">
                A
              </div>
              <div>
                <p className="font-semibold">Agus</p>
                <p className="text-sm text-white/70">Developer</p>
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <a 
                href="https://instagram.com/ketutaguss_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition group"
              >
                <Instagram className="w-5 h-5 text-pink-400 group-hover:scale-110 transition" />
                <span className="text-sm">@ketutaguss_</span>
              </a>

              <a 
                href="mailto:ask.jojo.app@gmail.com"
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition group"
              >
                <Mail className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
                <span className="text-sm">ask.jojo.app@gmail.com</span>
              </a>
            </div>

            <div className="pt-3 border-t border-white/20">
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-yellow-200 leading-relaxed">
                  <b>⚠️ Perhatian:</b> Aplikasi ini sedang dalam masa <b>pengembangan</b> dan dibuat sebagai proyek <b>pembelajaran</b> untuk mempelajari backend dan React. Jika menemukan bug atau masalah, silakan laporkan via email di atas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>© 2025 TikTok Downloader Pro - Universal App</p>
          <p className="mt-1">Android • iOS • Web • Desktop</p>
          <p className="mt-2 text-xs">Made with ❤️ by Agus</p>
        </div>
      </div>
    </div>
  );
                }


