import express from 'express';
import { getBranches, createBranch, getBranch, updateBranch, deleteBranch } from '../controllers/branchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getBranches)
  .post(protect, createBranch);

router.route('/:id')
  .get(getBranch)
  .put(protect, updateBranch)
  .delete(protect, deleteBranch);

export default router;
