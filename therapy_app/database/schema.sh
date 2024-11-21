CREATE DATABASE therapy;

CREATE TABLE users (
  uuid SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255)
);

CREATE TABLE therapists (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  experience INT,
  description TEXT
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL,
  therapist_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT
);

ALTER TABLE patients
  ADD CONSTRAINT fk_patients_users FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE therapists
  ADD CONSTRAINT fk_therapists_users FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_patients FOREIGN KEY (patient_id) REFERENCES patients(id);

ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_therapists FOREIGN KEY (therapist_id) REFERENCES therapists(id);

INSERT INTO users (username, password) VALUES 
('lina_push', 'password123'),
('suonica', 'securepass456');

INSERT INTO patients (user_id, first_name, last_name, phone, email) VALUES 
(1, 'ALina', 'Pushkareva', '123-456-7890', 'linpush@example.com'),
(2, 'Nika', 'Vechernina', '098-765-4321', 'suonica@example.com');

INSERT INTO users (username, password) VALUES 
('therapist_1', 'therapypswrd1'),
('therapist_2', 'therapypswrd1');

INSERT INTO therapists (user_id, specialization, description) VALUES 
(3, 'Family Therapy', 'Specialize in family relationship issues.'),
(4, 'Cognitive Behavioral Therapy', 'Specialize in the treatment of various mental disorders and problems.');

INSERT INTO sessions (patient_id, therapist_id, date, time, notes) VALUES 
(1, 1, '2024-11-01', '10:00:00', 'Family dynamics discussion. Focused on communication.'),
(2, 2, '2024-11-02', '11:00:00', 'Initial consultation. Discussed anxiety issues.');

