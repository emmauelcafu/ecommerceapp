require('dotenv').config();
const pool = require('../config/database');

const createTables = async () => {
    try {
        console.log('🚀 Iniciando migración de base de datos...');

        // Crear tabla roles
        await pool.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) UNIQUE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla roles creada');

        // Insertar roles por defecto
        await pool.query(`
            INSERT INTO roles (id, nombre) VALUES 
            (1, 'administrador'),
            (2, 'cliente')
            ON CONFLICT (nombre) DO NOTHING
        `);
        console.log('✅ Roles por defecto insertados');

        // Crear tabla users
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role_id INTEGER REFERENCES roles(id) DEFAULT 2,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla users creada');

        // Crear tabla products
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                descripcion TEXT,
                precio DECIMAL(10,2) NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                imagen_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla products creada');

        // Crear tabla orders
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                total DECIMAL(10,2) NOT NULL,
                estado VARCHAR(50) DEFAULT 'pendiente',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla orders creada');

        // Crear tabla order_items
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id),
                cantidad INTEGER NOT NULL,
                precio_unitario DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla order_items creada');

        // Crear índices para mejorar rendimiento
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
            CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
            CREATE INDEX IF NOT EXISTS idx_products_nombre ON products(nombre);
        `);
        console.log('✅ Índices creados');

        console.log('🎉 Migración completada exitosamente');

    } catch (error) {
        console.error('❌ Error en migración:', error);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        console.log('🌱 Sembrando datos de ejemplo...');

        // Usuario administrador por defecto
        const bcrypt = require('bcryptjs');
        const adminPassword = await bcrypt.hash('admin123', 12);

        await pool.query(`
            INSERT INTO users (nombre, email, password_hash, role_id) VALUES 
            ('Administrador', 'admin@ecommerce.com', $1, 1)
            ON CONFLICT (email) DO NOTHING
        `, [adminPassword]);

        console.log('👤 Usuario administrador creado (email: admin@ecommerce.com, password: admin123)');

        // Productos de ejemplo
        const productos = [
            ['Smartphone Galaxy A54', 'Smartphone Samsung Galaxy A54 con 128GB de almacenamiento', 299.99, 50, 'https://example.com/galaxy-a54.jpg'],
            ['Laptop HP Pavilion', 'Laptop HP Pavilion 15 con procesador Intel Core i5', 599.99, 25, 'https://example.com/hp-pavilion.jpg'],
            ['Auriculares Sony WH-1000XM4', 'Auriculares inalámbricos con cancelación de ruido', 249.99, 30, 'https://example.com/sony-headphones.jpg'],
            ['Tablet iPad Air', 'iPad Air con pantalla de 10.9 pulgadas', 549.99, 20, 'https://example.com/ipad-air.jpg'],
            ['Smartwatch Apple Watch Series 8', 'Apple Watch Series 8 con GPS', 399.99, 15, 'https://example.com/apple-watch.jpg'],
            ['Cámara Canon EOS R6', 'Cámara mirrorless Canon EOS R6', 1899.99, 10, 'https://example.com/canon-r6.jpg'],
            ['PlayStation 5', 'Consola PlayStation 5 con lector de discos', 499.99, 8, 'https://example.com/ps5.jpg'],
            ['Nintendo Switch OLED', 'Nintendo Switch con pantalla OLED', 349.99, 18, 'https://example.com/switch-oled.jpg']
        ];

        for (const producto of productos) {
            await pool.query(`
                INSERT INTO products (nombre, descripcion, precio, stock, imagen_url) 
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING
            `, producto);
        }

        console.log('📦 Productos de ejemplo insertados');
        console.log('🎉 Datos de ejemplo sembrados exitosamente');

    } catch (error) {
        console.error('❌ Error sembrando datos:', error);
    }
};

const main = async () => {
    await createTables();
    await seedDatabase();

    console.log('\n📊 Resumen de la base de datos:');
    console.log('✅ Tablas: roles, users, products, orders, order_items');
    console.log('✅ Usuario admin: admin@ecommerce.com / admin123');
    console.log('✅ Productos de ejemplo: 8 productos');

    process.exit(0);
};

if (require.main === module) {
    main();
}

module.exports = { createTables, seedDatabase };
