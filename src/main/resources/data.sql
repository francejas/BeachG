-- ==========================================
-- 1. CARGA DE CLIENTES
-- ==========================================
-- ID 1: "Cliente Mostrador" — cuenta universal para reservas presenciales (Walk-in)
--        Todas las reservas walk-in se crean con clientId=1.
-- IDs 2 al 10: Clientes de prueba
INSERT IGNORE INTO client (id_client, first_name, last_name, email, phone, password_hash, role) VALUES
(1,  'Cliente',   'Mostrador', 'mostrador@beachg.com',   '0000000000', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
(2,  'Xavier',    'Cejas',     'xavier@correo.com',       '2234567890', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
(3,  'Francisco', 'Cejas',     'francisco@correo.com',    '2231112233', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
(4,  'Marta',     'Gomez',     'marta.gomez@correo.com',  '1122334455', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
(5,  'Carlos',    'Lopez',     'carlos.l@correo.com',     '1144556677', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
(6,  'Agustina',  'Rios',      'agus.rios@correo.com',    '2239998877', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
(7,  'Juan',      'Perez',     'juanperez@correo.com',    '1133221100', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
(8,  'Lucia',     'Fernandez', 'lucia.f@correo.com',      '2235554433', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
(9,  'Roberto',   'Sosa',      'roberto.s@correo.com',    '1188776655', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
(10, 'Jimena',    'Diaz',      'jime.diaz@correo.com',    '2234445566', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'USER'),
-- ID 11: Admin del balneario — credenciales creadas por el equipo, role ADMIN
(11, 'Admin',     'BeachG',    'admin@beachg.com',        '0000000001', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'ADMIN');

-- ==========================================
-- 2. CARGA DE BALNEARIOS (RESORTS)
-- ==========================================
-- Tenemos dos balnearios para probar si los filtros por balneario funcionan bien
INSERT IGNORE INTO resort (id_resort, name, location, admin_email, password_hash, cover_photo_url, is_active) VALUES
(1, 'BeachG Club de Playa', 'Mar del Plata, Buenos Aires', 'admin@beachg.com', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'https://imagenes.com/playa-mdp.jpg', true),
(2, 'Ocean View', 'Pinamar, Buenos Aires', 'admin@oceanview.com', '$2a$10$2l7WCtz4nBzuYo24lXiC9O0ko4sEVfFznKoynnuxqFbzwzxamOu3q', 'https://imagenes.com/playa-pinamar.jpg', true);

-- ==========================================
-- 3. CARGA DE AMENITIES (SERVICIOS)
-- ==========================================
INSERT IGNORE INTO amenity (id_amenity, name) VALUES
(1, 'WiFi'),
(2, 'Pileta Climatizada'),
(3, 'Estacionamiento'),
(4, 'Restaurante'),
(5, 'Recreación Infantil'),
(6, 'Spa'),
(7, 'Barra de Tragos'),
(8, 'Duchas');

-- ==========================================
-- 4. VINCULAR AMENITIES A LOS BALNEARIOS
-- ==========================================
-- BeachG (Mar del Plata) tiene casi todo
INSERT IGNORE INTO resort_amenities (resorts_id_resort, amenities_id_amenity) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 8);

-- Ocean View (Pinamar) es más exclusivo y tiene Spa y Barra, pero no recreación infantil
INSERT IGNORE INTO resort_amenities (resorts_id_resort, amenities_id_amenity) VALUES
(2, 1), (2, 3), (2, 4), (2, 6), (2, 7), (2, 8);

-- ==========================================
-- 5. CARGA DE UNIDADES (CARPAS Y SOMBRILLAS)
-- ==========================================
-- UNIDADES PARA BEACHG (ID 1)
INSERT IGNORE INTO rental_unit (id_rental_unit, identifier, type, daily_price, is_blocked, id_resort) VALUES
-- Primera Fila (Más caras)
(1, 'A-01', 'TENT', 25000.0, false, 1),
(2, 'A-02', 'TENT', 25000.0, false, 1),
(3, 'A-03', 'TENT', 25000.0, false, 1),
-- Segunda Fila (Precio medio)
(4, 'B-10', 'TENT', 18000.0, false, 1),
(5, 'B-11', 'TENT', 18000.0, false, 1),
(6, 'B-12', 'TENT', 18000.0, false, 1),
-- Sombrillas (Más económicas)
(7, 'S-01', 'UMBRELLA', 10000.0, false, 1),
(8, 'S-02', 'UMBRELLA', 10000.0, false, 1),
(9, 'S-03', 'UMBRELLA', 10000.0, false, 1),
-- Unidad Bloqueada (Para probar tu validación de "Unidad No Disponible")
(10, 'A-99', 'TENT', 25000.0, true, 1);

-- UNIDADES PARA OCEAN VIEW (ID 2)
INSERT IGNORE INTO rental_unit (id_rental_unit, identifier, type, daily_price, is_blocked, id_resort) VALUES
-- Carpas VIP
(11, 'VIP-1', 'TENT', 35000.0, false, 2),
(12, 'VIP-2', 'TENT', 35000.0, false, 2),
-- Sombrillas cerca del Bar
(13, 'BAR-1', 'UMBRELLA', 15000.0, false, 2),
(14, 'BAR-2', 'UMBRELLA', 15000.0, false, 2),
(15, 'BAR-3', 'UMBRELLA', 15000.0, true, 2); -- Sombrilla rota/bloqueada