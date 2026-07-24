import express from 'express';
import { getAiInsights, getAiChatResponse, generateSalesForecast } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/insights', protect, getAiInsights);
router.post('/chat', protect, getAiChatResponse);
router.get('/forecast', protect, generateSalesForecast);
export default router;
