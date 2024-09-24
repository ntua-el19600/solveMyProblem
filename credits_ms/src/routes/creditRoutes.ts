import express from 'express';
import { purchaseCredits, getCredits, reduceCredits } from '../controllers/creditController';

const router = express.Router();

router.post('/purchase', purchaseCredits);
router.get('/:userId', getCredits);
router.post("/reduce", reduceCredits);

export default router;
