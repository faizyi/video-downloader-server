import express from "express";
import cors from "cors";
import downloaderRoutes from "./src/routes/index.js";
import ytdl from 'ytdl-core';

const app = express();
const PORT = 7001;


app.use(cors({
    origin: "http://localhost:5173",
    // origin: "https://open-video-downloader.vercel.app/",
    credentials: true 
}));
app.use(express.json());

app.use("/download", downloaderRoutes);
// const normalizeUrl = (url) => {
//     const shortsRegex = /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/;
//     const match = url.match(shortsRegex);
//     if (match) {
//       return `https://www.youtube.com/watch?v=${match[1]}`;
//     }
//     return url;
//   };
//   app.get('/download/yt', async (req, res) => {
//     try {
//       let url = req.query.url;
//       if (!url) {
//         return res.status(400).json({ error: 'No URL provided' });
//       }
  
//       url = normalizeUrl(url);
  
//       if (!ytdl.validateURL(url)) {
//         return res.status(400).json({ error: 'Invalid YouTube URL' });
//       }
  
//       // Get video info with full response
//       const info = await ytdl.getInfo(url, {
//         requestOptions: {
//           headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//           }
//         }
//       });
  
//       const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
//       const format = ytdl.chooseFormat(info.formats, {
//         quality: 'highestvideo',
//         filter: 'audioandvideo'
//       });
  
//       if (!format) {
//         return res.status(400).json({ error: 'No suitable format found' });
//       }
  
//       res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
//       res.header('Content-Type', 'video/mp4');
  
//       const stream = ytdl.downloadFromInfo(info, {
//         format: format,
//         quality: 'highestvideo',
//         filter: 'audioandvideo'
//       });
  
//       stream.on('error', (error) => {
//         console.error('Stream error:', error);
//         if (!res.headersSent) {
//           res.status(500).json({ error: 'Streaming error occurred', details: error.message });
//         }
//       });
  
//       stream.pipe(res);
  
//     } catch (error) {
//       console.error('Detailed error:', error);
//       if (!res.headersSent) {
//         res.status(500).json({ 
//           error: 'Error downloading video',
//           details: error.message 
//         });
//       }
//     }
//   });

app.get("/", (req, res) =>{
    res.send("Server is running");
});


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));