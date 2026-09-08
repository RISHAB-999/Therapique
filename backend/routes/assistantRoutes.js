import express from 'express';
import { chatWithAssistant } from '../controllers/assistantController.js';

const assistantRouter = express.Router();

// POST /api/assistant/chat — Public endpoint (no auth required)
// Rate limiting is handled inside the controller
assistantRouter.post('/chat', chatWithAssistant);

export default assistantRouter;
