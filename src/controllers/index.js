import { downloadFacebookVideo, getFacebookVideoInfo } from "../platfroms/downloadFacebookVideo.js";
import { downloadInstagramVideo, getInstagramVideoInfo } from "../platfroms/downloadInstagramVideo.js";
import { downloadLinkedInVideo, getLinkedInVideoInfo } from "../platfroms/downloadLinkedInVideo.js";
import { downloadPinterestVideo, getPinterestVideoInfo } from "../platfroms/downloadPinterestVideo.js";
import { downloadTikTokVideo, getTikTokVideoInfo } from "../platfroms/downloadTikTokVideo.js";
import { downloadYouTubeVideo, getYouTubeVideoInfo } from "../platfroms/downloadYouTubeVideo.js";
import { detectPlatform } from "../utils/detectPlatform.js";

  
  export const downloadVideo = async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
  
    const platform = detectPlatform(url);
    console.log(`Platform detected: ${platform}, URL: ${url}`);
  
    try {
      switch (platform) {
        case 'youtube':
          return await downloadYouTubeVideo(url, res);
        case 'tiktok':
          return await downloadTikTokVideo(url, res);
        case 'instagram':
          return await downloadInstagramVideo(url, res);
        case 'facebook':
          return await downloadFacebookVideo(url, res);
          case 'linkedin':
        return await downloadLinkedInVideo(url, res);
      case 'pinterest':
        return await downloadPinterestVideo(url, res);
        default:
          return res.status(400).json({ error: 'Unsupported platform' });
      }
    } catch (error) {
      console.error('Download Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  export const getVideoInfo = async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
  
    const platform = detectPlatform(url);
  
    try {
      switch (platform) {
        case 'youtube':
          return res.json(await getYouTubeVideoInfo(url));
        case 'tiktok':
          return res.json(await getTikTokVideoInfo(url));
        case 'instagram':
          return res.json(await getInstagramVideoInfo(url));
        case 'facebook':
          return res.json(await getFacebookVideoInfo(url));
          case 'linkedin':
        return res.json(await getLinkedInVideoInfo(url));
      case 'pinterest':
        return res.json(await getPinterestVideoInfo(url));
        default:
          return res.status(400).json({ error: 'Unsupported platform' });
      }
    } catch (error) {
      console.error('Info Error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  