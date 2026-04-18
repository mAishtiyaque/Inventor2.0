# Implementation Guidelines – Inventory & Manufacturing Platform

## Purpose

This document provides practical implementation guidelines to ensure the system remains:

- Maintainable
- Scalable
- Team-friendly
- Production-ready

These are engineering rules, not business rules.

---

## 1. Frontend Guidelines (React / Web UI)

### 1.1 Centralized UI Utilities (MANDATORY)

Do NOT scatter UI behaviors across components.

Create shared utilities for:

#### Spinner / Loader

- Single global loader service
- Reference-count based
- Automatically shows/hides

Example:

```
uiLoader.show()
uiLoader.hide()
```

#### Popup / Modal

- Central modal manager
- Avoid component-level modal logic

Example:

```
modal.open(CONFIRM_DELETE)
modal.close()
```

#### Alerts / Toasts

- One alert utility
- Standard severity levels

Example:

```
alert.success("Process completed")
alert.error("Inventory not available")
```

---

## 2. Frontend Structure (Recommended)

```
src/
 ├── api/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── utils/
 ├── store/
 └── constants/
```

Rules:

- API calls only inside `api/`
- Business logic inside `hooks/`
- UI components stay dumb

---

## 3. Backend Layering (STRICT) (.net8 and C#)

### Required Layers

```
controller
service
domain (model)
dto
repository
migration
config
exception
```

### Controller

- HTTP concerns only
- Validation
- DTO mapping
- Add pagging if list of dto returning

### Service

- Business logic
- State transitions
- Transactions

### Domain

- Entities
- Enums
- No DB logic

### DTO

- API contracts
- Never expose entities

### Repository

- DB access only

---

## 4. Database & Migration Rules (Postgres)

- Use sharding on tenant_id (multiple tenant in one shard)
- Flyway / Liquibase mandatory
- One change per migration
- Never edit old migrations

---

## 5. Transactions

- One transaction per service method
- Ledger writes must be atomic

---

## 6. Validation Strategy

| Type     | Layer      |
| -------- | ---------- |
| Input    | Controller |
| Business | Service    |
| DB       | Database   |

---

## 7. Error Handling

- Global exception handler
- Consistent error format

---

## 8. Logging & Auditing

- Correlation ID per request
- Ledger is source of audit

---

## 9. Security

- JWT with tenant_id
- Tenant context per request

---

## 10. Testing

- Service tests mandatory
- Ledger tests mandatory

---

## Final Note

Architecture discipline matters more than frameworks.
