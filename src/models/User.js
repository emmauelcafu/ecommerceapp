const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { nombre, email, password, roleId = 2 } = userData; // roleId 2 = cliente por defecto

        // Hash del password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const query = `
            INSERT INTO users (nombre, email, password_hash, role_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre, email, role_id, created_at
        `;

        const result = await pool.query(query, [nombre, email, passwordHash, roleId]);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const query = `
            SELECT u.id, u.nombre, u.email, u.password_hash, u.role_id, r.nombre as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `;

        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const query = `
            SELECT u.id, u.nombre, u.email, u.role_id, r.nombre as role, u.created_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async findAll() {
        const query = `
            SELECT u.id, u.nombre, u.email, r.nombre as role, u.created_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `;

        const result = await pool.query(query);
        return result.rows;
    }

    static async updateRole(userId, roleId) {
        const query = `
            UPDATE users 
            SET role_id = $1 
            WHERE id = $2
            RETURNING id, nombre, email, role_id
        `;

        const result = await pool.query(query, [roleId, userId]);
        return result.rows[0];
    }

    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;
