const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.stack);

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.message
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }

    // Error de base de datos
    if (err.code && err.code.startsWith('23')) { // PostgreSQL constraint errors
        return res.status(400).json({
            error: 'Error de base de datos',
            details: 'Violación de restricción de datos'
        });
    }

    // Error genérico del servidor
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
};

module.exports = {
    errorHandler
};
