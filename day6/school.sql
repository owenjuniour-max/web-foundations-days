-- ============================================================
-- Day 6: School Database Schema, Sample Data & Queries
-- Dialect: SQLite / ANSI SQL
-- ============================================================

-- ------------------------------------------------------------
-- 1. Table Definitions
-- ------------------------------------------------------------

-- Table: students
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: courses
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 3
);

-- Table: enrolments (Join Table linking students and courses)
CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE (student_id, course_id) -- Prevents duplicate enrolments for the same student on the same course
);

-- ------------------------------------------------------------
-- 2. Sample Data Inserts
-- ------------------------------------------------------------

-- Insert at least 3 students (adding 4 so that student 4 has no enrolments)
INSERT INTO students (name, email) VALUES
('Alice Johnson', 'alice.johnson@example.com'),
('Bob Smith', 'bob.smith@example.com'),
('Charlie Brown', 'charlie.brown@example.com'),
('Diana Prince', 'diana.prince@example.com');

-- Insert at least 3 courses
INSERT INTO courses (code, title, credits) VALUES
('CS101', 'Introduction to Computer Science', 3),
('WEB102', 'Web Foundations & Protocols', 4),
('DB201', 'Relational Database Design', 3);

-- Insert at least 5 enrolments
INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'),   -- Alice on CS101
(1, 2, 'B+'),  -- Alice on WEB102
(2, 2, 'A-'),  -- Bob on WEB102
(2, 3, 'B'),   -- Bob on DB201
(3, 1, 'C+');  -- Charlie on CS101

-- ------------------------------------------------------------
-- 3. Five Required Queries
-- ------------------------------------------------------------

-- Query 1: All courses for one student (by student name)
SELECT 
    s.name AS student_name,
    c.code AS course_code,
    c.title AS course_title,
    e.grade
FROM students s
JOIN enrolments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE s.name = 'Alice Johnson';

-- Query 2: All students on one course (by course title)
SELECT 
    c.title AS course_title,
    s.name AS student_name,
    s.email,
    e.grade
FROM courses c
JOIN enrolments e ON c.id = e.course_id
JOIN students s ON e.student_id = s.id
WHERE c.title = 'Web Foundations & Protocols';

-- Query 3: The number of students per course
SELECT 
    c.code,
    c.title,
    COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON c.id = e.course_id
GROUP BY c.id, c.code, c.title;

-- Query 4: Students who have no enrolments
SELECT 
    s.id,
    s.name,
    s.email
FROM students s
LEFT JOIN enrolments e ON s.id = e.student_id
WHERE e.id IS NULL;

-- Query 5: Update of one enrolment's grade
UPDATE enrolments
SET grade = 'A+'
WHERE student_id = (SELECT id FROM students WHERE name = 'Charlie Brown')
  AND course_id = (SELECT id FROM courses WHERE code = 'CS101');

-- Verification of Query 5 update
SELECT 
    s.name AS student_name,
    c.code AS course_code,
    e.grade AS updated_grade
FROM enrolments e
JOIN students s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
WHERE s.name = 'Charlie Brown';
