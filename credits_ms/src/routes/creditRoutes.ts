import express from 'express';
import { purchaseCredits, getCredits, reduceCreditsLinear, reduceCreditsVrp } from '../controllers/creditController';

const router = express.Router();

router.post('/purchase', purchaseCredits);
router.get('/:userId', getCredits); // Add this line to handle the GET request for fetching credits
// Route to handle credit reduction
router.post("/reduce_linear", reduceCreditsLinear);
router.post("/reduce_vrp", reduceCreditsVrp);
export default router;
