import { Router } from 'express';
import { UserController } from './userController';

const router = Router();
const userController = new UserController();

// Basic CRUD routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;