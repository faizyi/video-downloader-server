import puppeteer from "puppeteer";
import https from "https";

export const getLinkedInVideoInfo = async (url) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const info = await page.evaluate(() => {
    const video = document.querySelector("video");
    const title = document.title;
    const thumbnail = document.querySelector("meta[property='og:image']")?.content || '';
    const duration = Math.floor(video?.duration || 0);
    return { title, thumbnail, duration };
  });

  await browser.close();
  return info;
};

export const downloadLinkedInVideo = async (url, res) => {
  if (!url) {
    return res.status(400).json({ error: 'Missing video URL' });
  }

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for the video element to load
    await page.waitForSelector('video', { timeout: 10000 });

    const videoUrl = await page.evaluate(() => {
      const video = document.querySelector("video");
      return video?.src || '';  // Ensure you return an empty string if it's undefined
    });

    if (!videoUrl) {
      throw new Error("Video URL not found");
    }

    // Redirect to the actual video file
    res.redirect(videoUrl);

  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await browser.close();
  }
};
