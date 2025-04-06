import express from "express";
import cors from "cors";
import downloaderRoutes from "./src/routes/index.js";
import ytdl from 'ytdl-core';

const app = express();
const PORT = 7001;


app.use(cors({
    // origin: "http://localhost:5173",
    origin: "https://open-video-downloader.vercel.app/",
    credentials: true 
}));
app.use(express.json());

app.use("/download", downloaderRoutes);

app.get("/", (req, res) =>{
    res.send("Server is running");
});


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));