import express from "express";
import { processTasks } from "../controllers/aiController.js";

const router = express.Router();

router.post("/extract", processTasks);

export default router;