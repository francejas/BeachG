-- Cuenta Genérica para las ventas en el mostrador del balneario
-- ¿Qué hace el INSERT IGNORE?
--Le dice a la base de datos: "Intentá guardar este cliente. Si el correo 'mostrador@oceanclub.com' ya existe, no te enojes ni rompas el programa, simplemente ignorá esta instrucción y seguí adelante".
insert IGNORE INTO client (first_name, last_name, email, password_hash, phone)
VALUES ('Cliente', 'Mostrador', 'mostrador@oceanclub.com', 'dummy_password', '00000000');