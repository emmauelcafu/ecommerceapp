const express = require('express');
const { getUsers, updateUserRole } = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authenticateToken);
router.use(requireRole(['administrador']));

router.get('/', getUsers);
router.put('/:id/role', updateUserRole);

module.exports = router;
