import express from 'express';
import { purchaseCredits } from '../controllers/creditController';

const router = express.Router();

router.post('/purchase', purchaseCredits);

export default router;
