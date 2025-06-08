const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Listar todos los productos (público)
const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();

        res.json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Obtener producto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Crear producto (solo admin)
const createProduct = async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Datos de entrada inválidos',
                details: errors.array()
            });
        }

        const { nombre, descripcion, precio, stock, imagen_url } = req.body;

        const product = await Product.create({
            nombre,
            descripcion,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            imagen_url
        });

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            product
        });

    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Actualizar producto (solo admin)
const updateProduct = async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Datos de entrada inválidos',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const { nombre, descripcion, precio, stock, imagen_url } = req.body;

        // Verificar si el producto existe
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        const product = await Product.update(id, {
            nombre,
            descripcion,
            precio: parseFloat(precio),
            stock: parseInt(stock),
            imagen_url
        });

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            product
        });

    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Eliminar producto (solo admin)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el producto existe
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        await Product.delete(id);

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
