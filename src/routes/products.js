const express = require('express');
const { body } = require('express-validator');
const { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validaciones para productos
const productValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 2 })
        .withMessage('El nombre debe tener al menos 2 caracteres'),
    body('descripcion')
        .trim()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres'),
    body('precio')
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser un número mayor a 0'),
    body('stock')
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0'),
    body('imagen_url')
        .optional()
        .isURL()
        .withMessage('La URL de imagen debe ser válida')
];

// Rutas públicas
router.get('/', getProducts);
router.get('/:id', getProductById);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, requireRole(['administrador']), productValidation, createProduct);
router.put('/:id', authenticateToken, requireRole(['administrador']), productValidation, updateProduct);
router.delete('/:id', authenticateToken, requireRole(['administrador']), deleteProduct);

module.exports = router;
