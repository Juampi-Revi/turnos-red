import { Router } from 'express';
import {
  deleteTurno,
  getTurnoById,
  getTurnos,
  postTurno,
  putTurno,
} from '../controllers/turnosController.js';

const turnosRouter = Router();

turnosRouter.get('/', getTurnos);
turnosRouter.get('/:id', getTurnoById);
turnosRouter.post('/', postTurno);
turnosRouter.put('/:id', putTurno);
turnosRouter.delete('/:id', deleteTurno);

export default turnosRouter;
