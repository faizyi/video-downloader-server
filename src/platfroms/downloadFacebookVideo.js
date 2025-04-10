import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import https from "https";

puppeteer.use(StealthPlugin());

export const getFacebookVideoInfo = async (url) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();

    // Listen for network requests
    const videoUrlPromise = new Promise((resolve, reject) => {
      page.on('response', (response) => {
        // Only listen for video requests
        if (response.url().endsWith('.mp4') || response.url().includes('video')) {
          resolve(response.url()); // Get the URL of the video file
        }
      });
    });

    await page.setViewport({ width: 1280, height: 720 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for the video URL to be captured
    const videoUrl = await videoUrlPromise;
    if (!videoUrl) {
      throw new Error("Failed to capture video URL");
    }

    // Fetch video info (title, thumbnail, duration)
    const info = await page.evaluate(() => {
      const title = document.title || 'Untitled Video';
      const thumbnail = document.querySelector("meta[property='og:image']")?.content || '';
      const duration = document.querySelector("meta[property='og:video:duration']")?.content || '0';
      return { title, thumbnail, duration };
    });

    // Fetch video size
    const sizeInBytes = await new Promise((resolve, reject) => {
      https.get(videoUrl, { method: 'HEAD' }, (res) => {
        const len = res.headers['content-length'];
        if (len) resolve(parseInt(len));
        else reject(new Error("Content-Length not available"));
      }).on('error', reject);
    });

    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2); // Convert to MB

    return {
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      size: sizeInMB,
      videoUrl: videoUrl
    };

  } catch (error) {
    throw new Error(`Failed to fetch video info: ${error.message}`);
  } finally {
    await browser.close();
  }
};


export const downloadFacebookVideo = async (url, res) => {
  if (!url) {
    return res.status(400).json({ error: 'Missing video URL' });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    
    // console.log(`Navigating to: ${url}`);
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

    // console.log(`Video URL found: ${videoUrl}`);

    // Redirect to the actual video file
    res.redirect(videoUrl);

  } catch (error) {
    // console.error('Error in downloadFacebookVideo:', error.message);
    res.status(500).json({ error: error.message });
  } finally {
    await browser.close();
  }
};


