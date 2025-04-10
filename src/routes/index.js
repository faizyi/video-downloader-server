import { Router } from "express";
import { downloadVideo, getVideoInfo } from "../controllers/index.js";

const router = Router();


router.get("/", downloadVideo);
router.post("/info", getVideoInfo);


export default router