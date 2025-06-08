const pool = require('../config/database');

class Order {
    static async create(orderData) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { user_id, items, total } = orderData;

            // Crear la orden
            const orderQuery = `
                INSERT INTO orders (user_id, total, estado)
                VALUES ($1, $2, 'pendiente')
                RETURNING *
            `;

            const orderResult = await client.query(orderQuery, [user_id, total]);
            const order = orderResult.rows[0];

            // Crear los items de la orden y actualizar stock
            for (const item of items) {
                // Verificar stock disponible
                const stockQuery = `SELECT stock FROM products WHERE id = $1`;
                const stockResult = await client.query(stockQuery, [item.product_id]);

                if (stockResult.rows.length === 0) {
                    throw new Error(`Producto ${item.product_id} no encontrado`);
                }

                if (stockResult.rows[0].stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para producto ${item.product_id}`);
                }

                // Insertar item de orden
                const itemQuery = `
                    INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario)
                    VALUES ($1, $2, $3, $4)
                `;

                await client.query(itemQuery, [
                    order.id, 
                    item.product_id, 
                    item.cantidad, 
                    item.precio_unitario
                ]);

                // Actualizar stock
                const updateStockQuery = `
                    UPDATE products 
                    SET stock = stock - $1 
                    WHERE id = $2
                `;

                await client.query(updateStockQuery, [item.cantidad, item.product_id]);
            }

            await client.query('COMMIT');
            return order;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async findByUserId(userId) {
        const query = `
            SELECT o.*, 
                   COUNT(oi.id) as total_items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    static async findAll() {
        const query = `
            SELECT o.*, u.nombre as usuario_nombre, u.email as usuario_email,
                   COUNT(oi.id) as total_items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id, u.nombre, u.email
            ORDER BY o.created_at DESC
        `;

        const result = await pool.query(query);
        return result.rows;
    }

    static async findById(id) {
        const orderQuery = `
            SELECT o.*, u.nombre as usuario_nombre, u.email as usuario_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `;

        const itemsQuery = `
            SELECT oi.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `;

        const orderResult = await pool.query(orderQuery, [id]);
        const itemsResult = await pool.query(itemsQuery, [id]);

        if (orderResult.rows.length === 0) {
            return null;
        }

        const order = orderResult.rows[0];
        order.items = itemsResult.rows;

        return order;
    }

    static async updateStatus(id, estado) {
        const query = `
            UPDATE orders 
            SET estado = $1 
            WHERE id = $2
            RETURNING *
        `;

        const result = await pool.query(query, [estado, id]);
        return result.rows[0];
    }
}

module.exports = Order;
