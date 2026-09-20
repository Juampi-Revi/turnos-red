import { Router } from 'express';
import { welcome } from '../controllers/generalController.js';

const generalRouter = Router();

generalRouter.get('/', welcome);

export default generalRouter;
