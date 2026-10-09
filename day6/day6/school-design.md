# School Database Design & Architecture

This document details the relational schema design, entity relationships, indexing strategies, and database paradigm choice for the school management system.

---

## 1. Table Explanations

### `students`
- **Purpose**: Stores individual student demographic and account details.
- **Key Columns**:
  - `id`: Auto-incrementing primary key uniquely identifying each student.
  - `name`: Student's full name (`NOT NULL`).
  - `email`: Student's institutional email address, enforced as `NOT NULL` and `UNIQUE` to prevent duplicate student profiles.
  - `created_at`: Automatic timestamp recording registration date.

### `courses`
- **Purpose**: Represents academic courses offered by the institution.
- **Key Columns**:
  - `id`: Auto-incrementing primary key uniquely identifying each course.
  - `code`: Unique alphanumeric identifier (e.g., `CS101`, `WEB102`).
  - `title`: Descriptive course name (`NOT NULL`).
  - `credits`: Academic credit weight assigned to the course.

### `enrolments`
- **Purpose**: Acts as the associative bridge (join table) connecting students to the courses they take, capturing specific enrollment attributes.
- **Key Columns**:
  - `id`: Auto-incrementing primary key.
  - `student_id`: Foreign key referencing `students(id)`.
  - `course_id`: Foreign key referencing `courses(id)`.
  - `grade`: Academic mark achieved (e.g., `'A'`, `'B+'`).
  - `enrolled_at`: Timestamp recording enrollment date.
- **Integrity Rule**: A composite `UNIQUE (student_id, course_id)` constraint prevents duplicate registrations, ensuring a student cannot enroll in the same course more than once.

---

## 2. Entity Relationships & Join Table Rationale

### Relationships
- **Many-to-Many Relationship**: The conceptual relationship between **Students** and **Courses** is **many-to-many ($M:N$)**.
  - A single student can enroll in multiple courses.
  - A single course can be taken by multiple students.
- **Two One-to-Many Relationships**:
  - `students` to `enrolments` is **one-to-many ($1:N$)**: One student can have multiple enrollment rows.
  - `courses` to `enrolments` is **one-to-many ($1:N$)**: One course can have multiple enrollment rows.

### Why a Join Table is Needed
Relational database tables cannot cleanly store array or multi-valued attributes in a single cell without violating **First Normal Form (1NF)**. Without an associative join table:
1. Storing a list of `course_ids` in a single student row leads to messy string parsing, inability to enforce foreign keys, and difficult querying.
2. Duplicating student rows for every course creates massive data redundancy and update anomalies.
3. The `enrolments` join table decomposes the complex many-to-many relationship into two clean, normalized one-to-many relationships, while providing an intuitive home for relationship-specific attributes such as `grade` and `enrolled_at`.

---

## 3. Recommended Index & Justification

### Proposed Index
```sql
CREATE INDEX idx_enrolments_student_id ON enrolments(student_id);
