import puppeteer from "puppeteer";
import https from "https";
import fs from "fs";
import path from "path";

export const getInstagramVideoInfo = async (url) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  await page.goto(url, { waitUntil: "networkidle2" });

  // Wait for the video element to load completely
  await page.waitForSelector('video', { visible: true });

  const info = await page.evaluate(() => {
    const video = document.querySelector("video");
    // Ensure the video is loaded and has duration
    const title = document.title;
    const thumbnail = document.querySelector("meta[property='og:image']")?.content || '';
    const duration = video?.duration ? Math.floor(video.duration) : 0;
    return { title, thumbnail, duration };
  });

  await browser.close();
  return info;
};


export const downloadInstagramVideo = async (url, res) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  await page.goto(url, { waitUntil: "networkidle2" });

  // Extract video URL from Instagram page using <video> tag
  const videoUrl = await page.evaluate(() => {
    const video = document.querySelector("video");
    return video?.src;
  });

  await browser.close();

  if (!videoUrl) {
    return res.status(500).json({ error: "Video URL not found" });
  }

  // Redirect to the video URL for download
  res.redirect(videoUrl);
};