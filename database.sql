-- Script SQL para crear la base de datos de e-commerce
-- Ejecutar estos comandos en PostgreSQL

-- Crear base de datos (opcional, también se puede hacer desde psql)
-- CREATE DATABASE ecommerce_db;

-- Usar la base de datos
-- \c ecommerce_db;

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles por defecto
INSERT INTO roles (id, nombre) VALUES 
(1, 'administrador'),
(2, 'cliente')
ON CONFLICT (nombre) DO NOTHING;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    imagen_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de items de pedidos
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_nombre ON products(nombre);

-- Insertar usuario administrador por defecto
-- Nota: El password 'admin123' debe ser hasheado en la aplicación
-- INSERT INTO users (nombre, email, password_hash, role_id) VALUES 
-- ('Administrador', 'admin@ecommerce.com', '$2b$12$hashedpassword', 1);

-- Insertar productos de ejemplo
INSERT INTO products (nombre, descripcion, precio, stock, imagen_url) VALUES 
('Smartphone Galaxy A54', 'Smartphone Samsung Galaxy A54 con 128GB de almacenamiento', 299.99, 50, 'https://example.com/galaxy-a54.jpg'),
('Laptop HP Pavilion', 'Laptop HP Pavilion 15 con procesador Intel Core i5', 599.99, 25, 'https://example.com/hp-pavilion.jpg'),
('Auriculares Sony WH-1000XM4', 'Auriculares inalámbricos con cancelación de ruido', 249.99, 30, 'https://example.com/sony-headphones.jpg'),
('Tablet iPad Air', 'iPad Air con pantalla de 10.9 pulgadas', 549.99, 20, 'https://example.com/ipad-air.jpg'),
('Smartwatch Apple Watch Series 8', 'Apple Watch Series 8 con GPS', 399.99, 15, 'https://example.com/apple-watch.jpg')
ON CONFLICT DO NOTHING;
