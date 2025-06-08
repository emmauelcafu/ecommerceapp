const pool = require('../config/database');

class Product {
    static async create(productData) {
        const { nombre, descripcion, precio, stock, imagen_url = null } = productData;

        const query = `
            INSERT INTO products (nombre, descripcion, precio, stock, imagen_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const result = await pool.query(query, [nombre, descripcion, precio, stock, imagen_url]);
        return result.rows[0];
    }

    static async findAll() {
        const query = `
            SELECT * FROM products 
            WHERE stock > 0 
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query);
        return result.rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM products WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async update(id, productData) {
        const { nombre, descripcion, precio, stock, imagen_url } = productData;

        const query = `
            UPDATE products 
            SET nombre = $1, descripcion = $2, precio = $3, stock = $4, imagen_url = $5
            WHERE id = $6
            RETURNING *
        `;

        const result = await pool.query(query, [nombre, descripcion, precio, stock, imagen_url, id]);
        return result.rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM products WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async updateStock(id, newStock) {
        const query = `
            UPDATE products 
            SET stock = $1 
            WHERE id = $2
            RETURNING *
        `;

        const result = await pool.query(query, [newStock, id]);
        return result.rows[0];
    }
}

module.exports = Product;
