const User = require('../models/User');

// Obtener todos los usuarios (solo admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        res.json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Cambiar rol de usuario (solo admin)
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id } = req.body;

        // Validar role_id
        const validRoles = [1, 2]; // 1 = admin, 2 = cliente
        if (!validRoles.includes(parseInt(role_id))) {
            return res.status(400).json({
                error: 'Rol inválido',
                validRoles: {
                    1: 'administrador',
                    2: 'cliente'
                }
            });
        }

        // Verificar que el usuario existe
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // No permitir que el admin se cambie su propio rol
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                error: 'No puedes cambiar tu propio rol'
            });
        }

        // Actualizar rol
        const updatedUser = await User.updateRole(id, role_id);

        res.json({
            success: true,
            message: 'Rol de usuario actualizado exitosamente',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error actualizando rol de usuario:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getUsers,
    updateUserRole
};
