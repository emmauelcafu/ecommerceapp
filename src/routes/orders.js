const express = require('express');
const { body } = require('express-validator');
const { 
    createOrder, 
    getOrders, 
    getOrderById, 
    updateOrderStatus 
} = require('../controllers/orderController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validaciones para crear pedido
const orderValidation = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Los items son requeridos y deben ser un array'),
    body('items.*.product_id')
        .isInt({ min: 1 })
        .withMessage('El ID del producto debe ser un número entero válido'),
    body('items.*.cantidad')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0')
];

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para clientes y admins
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Rutas solo para clientes
router.post('/', requireRole(['cliente']), orderValidation, createOrder);

// Rutas solo para admins
router.put('/:id/status', requireRole(['administrador']), updateOrderStatus);

module.exports = router;
