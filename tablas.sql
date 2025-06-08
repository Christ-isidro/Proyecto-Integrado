CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('participante', 'administrador')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS imagenes (
  id_imagen SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  id_usuario INTEGER NOT NULL,
  ruta TEXT NOT NULL,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'admitido', 'rechazado')),
  CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votos (
    id_voto SERIAL PRIMARY KEY,
    id_imagen INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    fecha_voto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_imagen) REFERENCES imagenes(id_imagen) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE (id_imagen, id_usuario)
);
