const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware para verificar JWT
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            error: 'Token de acceso requerido' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuario en la base de datos
        const userQuery = `
            SELECT u.id, u.nombre, u.email, r.nombre as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `;
        const result = await pool.query(userQuery, [decoded.userId]);

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Token inválido' 
            });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        return res.status(403).json({ 
            error: 'Token inválido o expirado' 
        });
    }
};

// Middleware para verificar roles
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Usuario no autenticado' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'No tienes permisos para acceder a este recurso' 
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    requireRole
};
