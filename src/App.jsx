import React, { useState, useEffect, useRef } from "react";
import { Download, Video, Loader2, AlertCircle, Music, Sun, Moon, Share2 } from "lucide-react";

export default function TikTokDownloader() {
  // ============================
  //  THEME
  // ============================
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

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
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(fileUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  // ============================
  //  FETCH DATA
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
      // Replace with your actual API endpoint
      const apiUrl = `https://your-api-endpoint.com/api/tiktok?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (json.code !== 0) {
        setError(json.msg || "API Error.");
        setLoading(false);
        return;
      }

      setResult(json.data);
    } catch (err) {
      setError("Gagal terhubung ke server. Pastikan API endpoint sudah benar.");
    }

    setLoading(false);
  };

  // ============================
  //  RENDER
  // ============================
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-purple-900 via-pink-800 to-red-800"
          : "bg-gray-100"
      } p-4`}
    >
      <div className="max-w-3xl mx-auto py-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
            <Video className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">
            TikTok Downloader Pro
          </h1>
          <p className={theme === "dark" ? "text-pink-200" : "text-gray-700"}>
            Download Video / Foto Slide / Musik tanpa watermark
          </p>
          <p className="text-sm mt-2 text-white/70">
            ✨ Universal App - Android, iOS & Web
          </p>

          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition"
            >
              <AlertCircle className="w-5 h-5" />
              Info
            </button>
          </div>
        </div>

        {/* INFO PANEL */}
        {showInfo && (
          <div
            className={`mb-6 p-6 rounded-2xl shadow-xl ${
              theme === "dark"
                ? "bg-white/10 backdrop-blur text-white"
                : "bg-white border text-gray-800"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Informasi & Cara Pakai
            </h2>

            <div className="space-y-4">
              {/* Platform Support */}
              <div>
                <h3 className="font-bold text-lg mb-2">📱 Platform Support:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><b>Android:</b> Install via APK atau Play Store (jika dipublish)</li>
                  <li><b>iOS:</b> Install via TestFlight atau App Store (jika dipublish)</li>
                  <li><b>Web:</b> Akses langsung via browser (Chrome, Safari, Firefox)</li>
                  <li><b>Desktop:</b> Bisa diakses via browser atau PWA</li>
                </ul>
              </div>

              {/* Cara Pakai */}
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

              {/* Fitur */}
              <div>
                <h3 className="font-bold text-lg mb-2">✨ Fitur Utama:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>✅ Download video tanpa watermark (SD & HD)</li>
                  <li>✅ Download foto slide dengan preview carousel</li>
                  <li>✅ Download musik/audio dari video</li>
                  <li>✅ Auto-slide untuk foto dengan kontrol manual</li>
                  <li>✅ Swipe gesture untuk navigasi foto</li>
                  <li>✅ Dark mode & Light mode</li>
                  <li>✅ Share content ke aplikasi lain</li>
                  <li>✅ Responsive design untuk semua device</li>
                  <li>✅ Informasi lengkap (views, likes, comments)</li>
                </ul>
              </div>

              {/* Setup untuk Mobile */}
              <div>
                <h3 className="font-bold text-lg mb-2">🔧 Setup untuk Mobile App:</h3>
                <p className="mb-2">Untuk membuat APK/IPA dari kode ini:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
                  <li>Install Expo CLI: <code className="bg-black/20 px-2 py-1 rounded">npm install -g expo-cli</code></li>
                  <li>Init project: <code className="bg-black/20 px-2 py-1 rounded">npx create-expo-app TikTokDownloader</code></li>
                  <li>Copy kode ini ke App.js</li>
                  <li>Install dependencies yang diperlukan</li>
                  <li>Build untuk Android: <code className="bg-black/20 px-2 py-1 rounded">eas build -p android</code></li>
                  <li>Build untuk iOS: <code className="bg-black/20 px-2 py-1 rounded">eas build -p ios</code></li>
                </ol>
              </div>

              {/* Catatan */}
              <div>
                <h3 className="font-bold text-lg mb-2">⚠️ Catatan Penting:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Gunakan untuk keperluan pribadi dan edukasi</li>
                  <li>Hormati hak cipta pembuat konten</li>
                  <li>Ganti API endpoint dengan server Anda sendiri</li>
                  <li>Untuk production, deploy backend ke cloud (Heroku, Railway, dll)</li>
                  <li>Beberapa video mungkin tidak bisa diunduh karena pembatasan</li>
                </ul>
              </div>

              {/* Tech Stack */}
              <div className="pt-4 border-t border-white/20">
                <h3 className="font-bold text-lg mb-2">💻 Tech Stack:</h3>
                <p className="mb-1"><b>Frontend:</b> React / React Native (Expo)</p>
                <p className="mb-1"><b>Backend:</b> Express.js + TikTok API</p>
                <p className="mb-1"><b>UI:</b> Tailwind CSS + Lucide Icons</p>
                <p className="mb-1"><b>Platform:</b> Android, iOS, Web</p>
                <p className="mb-1"><b>Versi:</b> 2.0.0 (Universal)</p>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              Tutup
            </button>
          </div>
        )}

        {/* INPUT BOX */}
        <div
          className={`p-6 rounded-2xl shadow-xl ${
            theme === "dark"
              ? "bg-white/10 backdrop-blur"
              : "bg-white border"
          } mb-6`}
        >
          <label className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            URL TikTok
          </label>
          <div className="relative mt-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              className={`w-full px-4 py-3 pr-24 rounded-lg ${
                theme === "dark"
                  ? "bg-white/20 border-white/30 text-white placeholder-gray-300"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
              } border focus:outline-none focus:ring-2 focus:ring-pink-500`}
              placeholder="https://www.tiktok.com/@user/video/..."
            />
            <button
              onClick={handlePaste}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-semibold transition ${
                theme === "dark"
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Paste
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 transition"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Download className="w-6 h-6" />
            )}
            {loading ? "Mengambil data..." : "Download"}
          </button>

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/40 p-4 rounded-lg text-red-100 flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* RESULT */}
        {result && (
          <div
            className={`p-6 rounded-2xl shadow-xl ${
              theme === "dark"
                ? "bg-white/10 backdrop-blur text-white"
                : "bg-white border text-black"
            } space-y-6`}
          >
            {/* INFO */}
            <div
              className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-white/10" : "bg-gray-100"
              }`}
            >
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
            <div
              className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-white/10" : "bg-gray-100"
              }`}
            >
              <h3 className="font-bold text-xl mb-4">Preview</h3>

              {/* FOTO SLIDE */}
              {Array.isArray(result.images) && result.images.length > 0 ? (
                <div className="w-full">
                  <div
                    className="w-full overflow-hidden rounded-xl mb-4 relative"
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
                            : "bg-gray-500 scale-100 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>

                  {/* AUTO SLIDE TOGGLE */}
                  <button
                    onClick={() => setAutoSlide(!autoSlide)}
                    className="px-4 py-2 rounded-lg bg-pink-600 text-white font-semibold mx-auto block mb-4 hover:bg-pink-700 transition"
                  >
                    Auto Slide: {autoSlide ? "ON" : "OFF"}
                  </button>

                  {/* DOWNLOAD & SHARE BUTTONS */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadImage(result.images[index], index)}
                      className="flex-1 py-3 bg-pink-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-pink-700 transition"
                    >
                      <Download className="w-6 h-6" />
                      Download Foto {index + 1}
                    </button>
                    <button
                      onClick={() => shareContent(result.images[index], 'image')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-blue-700 transition"
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
                    className="w-full rounded-xl mb-4"
                    controls
                    playsInline
                    preload="metadata"
                  />

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => downloadVideo(false)}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-blue-700 transition"
                      >
                        <Download className="w-6 h-6" />
                        Download SD
                      </button>
                      <button
                        onClick={() => shareContent(result.play, 'video')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-indigo-700 transition"
                      >
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>

                    {result.hdplay && (
                      <button
                        onClick={() => downloadVideo(true)}
                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-green-700 transition"
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
            <div
              className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-white/10" : "bg-gray-100"
              }`}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Music />
                Music
              </h3>

              <p className="truncate"><b>Judul:</b> {result.music_info?.title || "-"}</p>
              <p className="truncate"><b>Artist:</b> {result.music_info?.author || "-"}</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={downloadMusic}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-indigo-700 transition"
                >
                  <Download className="w-6 h-6" />
                  Download Music
                </button>
                <button
                  onClick={() => shareContent(result.music_info?.play, 'music')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold flex justify-center gap-2 hover:bg-purple-700 transition"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>© 2025 TikTok Downloader Pro - Universal App</p>
          <p className="mt-1">Android • iOS • Web • Desktop</p>
        </div>
      </div>
    </div>
  );
}