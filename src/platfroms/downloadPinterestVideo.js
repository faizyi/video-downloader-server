import axios from 'axios';
import * as cheerio from 'cheerio'; // Updated import statement
import https from 'https';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

export const getPinterestVideoInfo = async (url) => {
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

export const downloadPinterestVideo = async (url, res) => {
  try {
    // Make a GET request to the Pinterest URL
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      },
    });

    // Load the HTML content into cheerio
    const $ = cheerio.load(response.data);

    // Find the video URL in the HTML (search for video tag or specific script containing the video URL)
    let videoUrl = null;

    // Look for a video tag with the src attribute
    const videoElement = $('video');
    if (videoElement.length > 0) {
      videoUrl = videoElement.attr('src');
    }

    // If video URL is not found, try to find it in the scripts (common in Pinterest)
    if (!videoUrl) {
      const scripts = $('script');
      scripts.each((i, script) => {
        const scriptContent = $(script).html();
        const regex = /"videoUrl":"(https:[^"]+\.mp4)"/; // Regex to capture the video URL
        const match = regex.exec(scriptContent);
        if (match && match[1]) {
          videoUrl = match[1];
        }
      });
    }

    // If video URL is still not found
    if (!videoUrl) {
      console.error('Failed to retrieve valid video URL');
      return res.status(500).json({ error: 'Failed to retrieve valid video URL' });
    }

    console.log('Found video URL:', videoUrl);

    // Define file path for saving the video
    const filePath = path.resolve('downloads', 'pinterest_video.mp4');
    const writer = fs.createWriteStream(filePath);
    const videoStream = await axios({
      url: videoUrl,
      method: 'GET',
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    videoStream.data.pipe(writer);
    writer.on('finish', () => {
      res.download(filePath, 'pinterest_video.mp4', () => fs.unlinkSync(filePath));
    });
  } catch (err) {
    console.error('Error in downloadPinterestVideo:', err); // Log the error
    res.status(500).json({ error: 'Internal server error' });
  }
};