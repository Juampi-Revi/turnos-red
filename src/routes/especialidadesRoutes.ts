import { Router } from 'express';
import {
  createEspecialidadHandler,
  deleteEspecialidadHandler,
  getEspecialidadByIdHandler,
  listEspecialidadesHandler,
  updateEspecialidadHandler,
} from '../controllers/especialidadesController.js';

const especialidadesRouter = Router();

especialidadesRouter.get('/', listEspecialidadesHandler);
especialidadesRouter.get('/:id', getEspecialidadByIdHandler);
especialidadesRouter.post('/', createEspecialidadHandler);
especialidadesRouter.put('/:id', updateEspecialidadHandler);
especialidadesRouter.delete('/:id', deleteEspecialidadHandler);

export default especialidadesRouter;
