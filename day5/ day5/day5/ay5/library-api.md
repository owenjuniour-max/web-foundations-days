# Library Books REST API Specification

This document outlines the RESTful API design for managing a library's collection of books (`/api/v1/books`). It defines standard HTTP methods, resource endpoints, request/response formats, status codes, error handling, authentication, and pagination.

---

## 1. Endpoints Overview

### Endpoint 1: List All Books
- **Method**: `GET`
- **Path**: `/api/v1/books`
- **Description**: Retrieves a paginated list of all books in the library catalog.
- **Request Body**: None
- **Success Status Code**: `200 OK`
- **Example Response**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "isbn": "9780061120084",
      "publishedYear": 1960,
      "availableCopies": 4
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
