import axios from "axios";

export default async function handler(req, res) {
  const url = req.query.url;

  if (!url)
    return res.status(400).json({ code: 400, msg: "URL tidak boleh kosong" });

  try {
    const apiURL = await axios.get("https://tikwm.com/api/", {
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

    // axios response ada di apiURL.data
    res.status(200).json(apiURL.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, msg: "Gagal mengambil data dari API" });
  }
}
