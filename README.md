<<<<<<< HEAD
# E-commerce Backend API

## Descripción
API REST para aplicación de e-commerce con autenticación JWT y sistema de roles.

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tu configuración de base de datos
```

4. Crear base de datos PostgreSQL y ejecutar migraciones:
```bash
npm run migrate
```

5. Ejecutar en modo desarrollo:
```bash
npm run dev
```

## Endpoints de la API

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

### Productos
- `GET /products` - Listar productos (público)
- `POST /products` - Crear producto (solo admin)
- `PUT /products/:id` - Actualizar producto (solo admin)
- `DELETE /products/:id` - Eliminar producto (solo admin)

### Pedidos
- `GET /orders` - Listar pedidos (admin ve todos, cliente solo los suyos)
- `POST /orders` - Crear pedido (solo cliente)
- `GET /orders/:id` - Ver pedido específico

### Usuarios (solo admin)
- `GET /users` - Listar usuarios
- `PUT /users/:id/role` - Cambiar rol de usuario

## Roles de Usuario
- **cliente**: Puede ver productos, crear pedidos, ver sus propios pedidos
- **administrador**: Acceso completo a productos, pedidos y usuarios

## Estructura de la Base de Datos

### Tablas principales:
- `roles`: id, nombre
- `users`: id, nombre, email, password_hash, role_id, created_at
- `products`: id, nombre, descripcion, precio, stock, imagen_url, created_at
- `orders`: id, user_id, total, estado, created_at
- `order_items`: id, order_id, product_id, cantidad, precio_unitario
=======
# ecommerceapp
>>>>>>> 99566b61845324e24acd1014dba7fce9e3f4c678
