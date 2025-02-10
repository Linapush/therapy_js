DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

\c therapy;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('user', 'admin'))
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  time TIME NOT NULL,
  notes TEXT
);

CREATE TABLE user_to_session (
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    session_status VARCHAR(50) NOT NULL CHECK (session_status IN ('scheduled', 'canceled')),
    PRIMARY KEY (user_id, session_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

INSERT INTO users (username, password, role) VALUES
('admin', crypt('admin', gen_salt('bf')), 'admin'),
('linapush', crypt('password123', gen_salt('bf')), 'user'),
('vechernika', crypt('secure456', gen_salt('bf')), 'user');

INSERT INTO sessions (date, time, notes) VALUES 
('2024-11-01', '10:00:00', 'Жизненный выбор'),
('2024-11-02', '11:00:00', 'Работа с эмоциональным состоянием'),
('2024-11-04', '13:00:00', 'Семейное дело'),
('2024-11-03', '12:00:00', 'Отношения с коллегами'),
('2024-11-06', '15:00:00', 'Пубертатный период'),
('2024-11-05', '14:00:00', 'Профессиональное выгорание');

INSERT INTO user_to_session (user_id, session_id, session_status) VALUES 
(2, 1, 'scheduled'),
(2, 2, 'scheduled'),
(2, 6, 'scheduled'),
(3, 3, 'scheduled'),
(3, 4, 'scheduled'),
(3, 5, 'scheduled');
