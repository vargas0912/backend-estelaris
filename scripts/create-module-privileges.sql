-- ============================================
-- Script para crear privileges de un módulo
-- ============================================
--
-- INSTRUCCIONES:
-- 1. Reemplazar {MODULE_NAME} con el nombre del módulo (ej: products, employees)
-- 2. Reemplazar {Module} con el nombre singular (ej: product, employee)
-- 3. Ejecutar en tu DB

-- EJEMPLO: Módulo "products"
-- {MODULE_NAME} = products
-- {Module} = product

-- ============================================
-- PRIVILEGES BÁSICOS (CRUD)
-- ============================================

-- View (Ver lista/módulo)
INSERT INTO privileges (name, codename, module, created_at, updated_at)
VALUES
  ('Ver {MODULE_NAME}', 'view_{MODULE_NAME}', '{MODULE_NAME}', NOW(), NOW());

-- Create (Crear registro)
INSERT INTO privileges (name, codename, module, created_at, updated_at)
VALUES
  ('Crear {Module}', 'create_{Module}', '{MODULE_NAME}', NOW(), NOW());

-- Update (Editar registro)
INSERT INTO privileges (name, codename, module, created_at, updated_at)
VALUES
  ('Actualizar {Module}', 'update_{Module}', '{MODULE_NAME}', NOW(), NOW());

-- Delete (Eliminar registro)
INSERT INTO privileges (name, codename, module, created_at, updated_at)
VALUES
  ('Eliminar {Module}', 'delete_{Module}', '{MODULE_NAME}', NOW(), NOW());

-- ============================================
-- PRIVILEGES ADICIONALES (opcional)
-- ============================================

-- Activar/Desactivar
INSERT INTO privileges (name, codename, module, created_at, updated_at)
VALUES
  ('Activar {Module}', 'activate_{Module}', '{MODULE_NAME}', NOW(), NOW()),
  ('Desactivar {Module}', 'deactivate_{Module}', '{MODULE_NAME}', NOW(), NOW());

-- Exportar/Importar
INSERT INTO privileges (name, codename, module, created_at, updated_at)
VALUES
  ('Exportar {MODULE_NAME}', 'export_{MODULE_NAME}', '{MODULE_NAME}', NOW(), NOW()),
  ('Importar {MODULE_NAME}', 'import_{MODULE_NAME}', '{MODULE_NAME}', NOW(), NOW());

-- ============================================
-- ASIGNAR A ADMIN (user_id = 2)
-- ============================================

-- View (básico, todos los admins)
INSERT INTO user_privileges (user_id, privilege_id, created_at, updated_at)
SELECT 2, id, NOW(), NOW() FROM privileges
WHERE codename = 'view_{MODULE_NAME}';

-- Create, Update, Delete (opcional, según necesidad)
INSERT INTO user_privileges (user_id, privilege_id, created_at, updated_at)
SELECT 2, id, NOW(), NOW() FROM privileges
WHERE codename IN ('create_{Module}', 'update_{Module}', 'delete_{Module}');

-- ============================================
-- VERIFICAR PRIVILEGES CREADOS
-- ============================================

SELECT id, name, codename, module
FROM privileges
WHERE module = '{MODULE_NAME}'
ORDER BY codename;

-- ============================================
-- VERIFICAR ASIGNACIÓN A ADMIN
-- ============================================

SELECT
  u.name AS user_name,
  u.role,
  p.codename,
  p.module
FROM users u
JOIN user_privileges up ON u.id = up.user_id
JOIN privileges p ON up.privilege_id = p.id
WHERE u.id = 2 AND p.module = '{MODULE_NAME}'
ORDER BY p.codename;
