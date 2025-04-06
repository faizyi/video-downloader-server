import puppeteer from "puppeteer";
import https from "https";
import fs from "fs";
import path from "path";

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
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const videoUrl = await page.evaluate(() => {
    const video = document.querySelector("video");
    return video?.src;
  });

  await browser.close();

  if (!videoUrl) return res.status(500).json({ error: "Video URL not found" });

  const filePath = path.resolve("downloads", "linkedin_video.mp4");
  const file = fs.createWriteStream(filePath);

  https.get(videoUrl, (response) => {
    response.pipe(file);
    file.on("finish", () => {
      file.close(() => {
        res.download(filePath, "linkedin_video.mp4", () => fs.unlinkSync(filePath));
      });
    });
  }).on("error", () => {
    fs.unlinkSync(filePath);
    res.status(500).json({ error: "Video download failed" });
  });
};
