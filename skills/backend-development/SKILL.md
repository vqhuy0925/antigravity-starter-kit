---
name: backend-development
description: Standards and architectural patterns for RESTful backend services, DTO contracts, ORM data access, and transactional integrity.
---

# Backend Development Standards

## 1. Layered Architecture
- **Controller/Resource**: Exposes REST endpoints, handles HTTP status codes, validates input DTOs.
- **Service Layer**: Encapsulates business logic, orchestrates transactions, fires domain events.
- **Repository/DAO**: Manages database queries using parameterized JPA/ORM methods.
- **Entity**: Maps strictly to database tables. Never expose Entities directly to API responses.

## 2. Data Transfer Objects (DTOs) & Validation
- Always map incoming requests and outgoing responses through dedicated DTOs.
- Enforce input constraints using validator annotations (`@NotNull`, `@Size`, `@Pattern`, `zod`, `class-validator`).

## 3. Transaction & Exception Management
- Wrap modifying business operations in transactional contexts.
- Use global exception handlers to map domain exceptions into standardized JSON error responses.
