DROP DATABASE IF EXISTS parkindb;

CREATE DATABASE parkindb
CHARACTER SET utf8mb4
COLLATE utf8mb4_spanish_ci;

USE parkindb;

CREATE TABLE aparcamiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    planta VARCHAR(10) NOT NULL,
    numero INT NOT NULL,
    disponible BOOLEAN NOT NULL,
    precio_hora DECIMAL(4,2) NOT NULL
);

CREATE TABLE ticket (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aparcamiento_id INT NOT NULL,
    matricula VARCHAR(50) NOT NULL,
    precio_hora  DECIMAL(4, 2) NOT NULL,
    fecha_entrada DATETIME NOT NULL,
    fecha_salida DATETIME,
    total_pagar DECIMAL(5,2),
    FOREIGN KEY (aparcamiento_id) REFERENCES aparcamiento(id)
);

INSERT INTO aparcamiento (planta, numero, disponible, precio_hora) VALUES
('1', 1, true, 0.25),
('1', 2, true, 0.25),
('1', 3, true, 0.25),
('1', 4, true, 0.25),
('1', 5, true, 0.25),
('1', 6, true, 0.25),
('1', 7, true, 0.25),
('1', 8, true, 0.25),
('1', 9, true, 0.25),
('1', 10, true, 0.25),
('1', 11, true, 0.25),
('1', 12, true, 0.25),
('1', 13, true, 0.25),
('1', 14, true, 0.25),
('1', 15, true, 0.25),
('1', 16, true, 0.25),
('1', 17, true, 0.25),
('1', 18, true, 0.25),
('1', 19, true, 0.25),
('1', 20, true, 0.25),
('2', 21, true, 0.25),
('2', 22, true, 0.25),
('2', 23, true, 0.25),
('2', 24, true, 0.25),
('2', 25, true, 0.25),
('2', 26, true, 0.25),
('2', 27, true, 0.25),
('2', 28, true, 0.25),
('2', 29, true, 0.25),
('2', 30, true, 0.25),
('2', 31, true, 0.25),
('2', 32, true, 0.25),
('2', 33, true, 0.25),
('2', 34, true, 0.25),
('2', 35, true, 0.25),
('2', 36, true, 0.25),
('2', 37, true, 0.25),
('2', 38, true, 0.25),
('2', 39, true, 0.25),
('2', 40, true, 0.25);

select * from aparcamiento;

select * from ticket;

SELECT * FROM ticket WHERE fecha_salida IS NULL;
