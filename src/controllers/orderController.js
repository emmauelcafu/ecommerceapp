const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Crear pedido (solo cliente)
const createOrder = async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Datos de entrada inválidos',
                details: errors.array()
            });
        }

        const { items } = req.body; // Array de { product_id, cantidad }
        const user_id = req.user.id;

        if (!items || items.length === 0) {
            return res.status(400).json({
                error: 'El pedido debe contener al menos un producto'
            });
        }

        // Calcular el total y validar productos
        let total = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product_id);

            if (!product) {
                return res.status(400).json({
                    error: `Producto ${item.product_id} no encontrado`
                });
            }

            if (product.stock < item.cantidad) {
                return res.status(400).json({
                    error: `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`
                });
            }

            const subtotal = product.precio * item.cantidad;
            total += subtotal;

            orderItems.push({
                product_id: item.product_id,
                cantidad: item.cantidad,
                precio_unitario: product.precio
            });
        }

        // Crear la orden
        const order = await Order.create({
            user_id,
            items: orderItems,
            total
        });

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            order: {
                id: order.id,
                total: order.total,
                estado: order.estado,
                created_at: order.created_at
            }
        });

    } catch (error) {
        console.error('Error creando pedido:', error);
        res.status(500).json({
            error: error.message || 'Error interno del servidor'
        });
    }
};

// Obtener pedidos (admin ve todos, cliente solo los suyos)
const getOrders = async (req, res) => {
    try {
        let orders;

        if (req.user.role === 'administrador') {
            // Admin ve todos los pedidos
            orders = await Order.findAll();
        } else {
            // Cliente ve solo sus pedidos
            orders = await Order.findByUserId(req.user.id);
        }

        res.json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Obtener pedido por ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        // Verificar permisos: solo el cliente dueño o admin puede ver el pedido
        if (req.user.role !== 'administrador' && order.user_id !== req.user.id) {
            return res.status(403).json({
                error: 'No tienes permisos para ver este pedido'
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Error obteniendo pedido:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Actualizar estado del pedido (solo admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const validStates = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

        if (!validStates.includes(estado)) {
            return res.status(400).json({
                error: 'Estado inválido',
                validStates
            });
        }

        const order = await Order.updateStatus(id, estado);

        if (!order) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Estado del pedido actualizado exitosamente',
            order
        });

    } catch (error) {
        console.error('Error actualizando estado del pedido:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
};
