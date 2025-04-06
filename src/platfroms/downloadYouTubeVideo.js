import ytdl from 'ytdl-core';
import axios from 'axios';
import youtubedl from 'youtube-dl-exec';
import { PassThrough } from 'stream';



const normalizeYouTubeUrl = (url) => {
    const shortsRegex = /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/;
    const match = url.match(shortsRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
    return url;
  };
  

  export const downloadYouTubeVideo = async (url, res) => {
    try {
      const videoId = await ytdl.getVideoID(url);
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      res.status(200).json({ url: embedUrl });
    } catch (error) {
      console.error('YouTube Download Error:', error);
      res.status(500).json({ error: 'Failed to fetch YouTube embed URL' });
    }
  };
  
  
  
  export const getYouTubeVideoInfo = async (url) => {
    try {
      const normalizedUrl = normalizeYouTubeUrl(url);
      const info = await ytdl.getBasicInfo(normalizedUrl);
  
      return {
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails.at(-1)?.url || '',
        duration: parseInt(info.videoDetails.lengthSeconds),
        formats: info.formats.map(f => ({
          qualityLabel: f.qualityLabel,
          format: f.mimeType,
        })),
      };
    } catch (error) {
      console.error('YouTube Info Error:', error);
      throw new Error('Failed to fetch YouTube video info');
    }
  };
  
