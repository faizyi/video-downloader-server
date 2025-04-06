import puppeteer from "puppeteer";
import https from "https";
import fs from "fs";
import path from "path";

export const getTikTokVideoInfo = async (url) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    userDataDir: './user_data', // Store user data to retain cookies and cache
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();

  // Set a custom User-Agent to avoid detection
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

  // Extract metadata (including video title, thumbnail, and duration)
  const info = await page.evaluate(() => {
    const video = document.querySelector('video');
    const title = document.title; // Use document title for video name
    const thumbnail = video?.poster || ''; // Try getting the video poster as a thumbnail
    const duration = Math.floor(video?.duration || 0); // Duration in seconds

    // In case poster is not available, try to find the thumbnail image directly
    if (!thumbnail) {
      const img = document.querySelector('meta[property="og:image"]');
      return {
        title,
        thumbnail: img ? img.getAttribute('content') : '',
        duration,
      };
    }

    return { title, thumbnail, duration };
  });

  await browser.close();
  return info;
};

export const downloadTikTokVideo = async (url, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    userDataDir: "./user_data", // Store user data to retain cookies and cache
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"]
  });

  const page = await browser.newPage();

  // Set a custom User-Agent to avoid detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  // Ensure the downloads folder exists
  const downloadFolder = path.resolve("downloads");
  if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder); // Create the downloads folder if it doesn't exist
  }

  // Intercept network requests to find the video URL
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "media") {
      const videoUrl = request.url();
      console.log("Video URL: ", videoUrl); // Log the video URL for debugging

      if (videoUrl) {
        // Define the file path for the video
        const filePath = path.resolve(downloadFolder, "tiktok_video.mp4");
        const file = fs.createWriteStream(filePath);

        https.get(videoUrl, (response) => {
          response.pipe(file);
          file.on("finish", () => {
            file.close(() => {
              res.download(filePath, "tiktok_video.mp4", (err) => {
                if (err) {
                  console.error("Download error:", err);
                }
                // Clean up the file after download if it exists
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath); // Clean up the file after download
                }
              });
            });
          });
        }).on("error", (err) => {
          console.error("Download error:", err);
          // Clean up the file if download fails
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(500).json({ error: "Video download failed" });
        });
      }
      request.abort(); // Abort the original request to avoid duplication
    } else {
      request.continue(); // Continue with other requests
    }
  });

  try {
    // Load the TikTok page
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  } catch (err) {
    console.error("Page load error:", err);
    res.status(500).json({ error: "Failed to load the TikTok page." });
  }

  await browser.close();
};