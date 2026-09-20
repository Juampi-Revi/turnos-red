import { Router } from 'express';
import {
  createProfesionalHandler,
  deleteProfesionalHandler,
  getProfesionalByIdHandler,
  listProfesionalesHandler,
  updateProfesionalHandler,
} from '../controllers/profesionalesController.js';

const profesionalesRouter = Router();

profesionalesRouter.get('/', listProfesionalesHandler);
profesionalesRouter.get('/:id', getProfesionalByIdHandler);
profesionalesRouter.post('/', createProfesionalHandler);
profesionalesRouter.put('/:id', updateProfesionalHandler);
profesionalesRouter.delete('/:id', deleteProfesionalHandler);

export default profesionalesRouter;
