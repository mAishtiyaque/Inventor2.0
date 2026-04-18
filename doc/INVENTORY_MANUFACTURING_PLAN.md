
# Multi-Tenant Inventory & Manufacturing System – Master Plan

## 1. Purpose

This document defines the complete functional and technical design for a multi-tenant inventory management system with manufacturing workflows, supporting:

- Multi-step processing
- Multi-input → multi-output assembly
- Tenant-specific rules
- Costing (material, labor, machine, overhead)
- Full audit trail (ledger-based)
- Partial completion, scrap, and rework

This design is ERP-grade, scalable, and audit-safe.

---

## 2. Core Principles (Non-Negotiable)

1. Inventory is ledger-driven, never directly updated
2. `process_definition` defines the rule
3. `process_execution` captures reality
4. Definitions are versioned, never mutated
5. Quantity and cost always move together
6. Everything is tenant-scoped

---

## 3. Multi-Tenant Model

### Strategy
- Single application
- Shared database
- `tenant_id` present in every business table

### Isolation
- Application-level enforcement
- JWT / Security context carries `tenant_id`

---

## 4. Product Model

### Product Types
- RAW – Raw material
- WIP – Work in progress
- FG – Finished goods
- SCRAP – Rejected / waste

### Product Table
```
product
- id
- tenant_id
- code
- name
- product_type (RAW | WIP | FG | SCRAP)
- uom
```

---

## 5. Process Definition (The Rule)

Represents a manufacturing template.

```
process_definition
- id
- tenant_id
- name
```

### Versioning
```
process_definition_version
- id
- process_definition_id
- version
- effective_from
- effective_to
- status (ACTIVE | RETIRED)
```

---

## 6. BOM & IO Definition

```
process_io_definition
- process_definition_version_id
- product_id
- direction (IN | OUT)
- standard_qty
- uom
- scrap_percentage
```

Example:
```
WIP_FRAME  → 1
SCREWS     → 12
GLUE       → 0.2 kg
FG_TABLE   ← 1
```

---

## 7. Cost Model

### Cost Types
- MATERIAL
- LABOR
- MACHINE
- OVERHEAD

```
process_cost_definition
- process_definition_version_id
- cost_type
- rate
- uom
```

---

## 8. Process Execution

```
process_execution
- id
- tenant_id
- process_definition_version_id
- vendor_id
- planned_qty
- actual_output_qty
- status
- started_at
- completed_at
```

```
process_execution_io
- process_execution_id
- product_id
- direction
- planned_qty
- actual_qty
- actual_cost
```

---

## 9. Process State Machine

Main States:
- DRAFT
- PLANNED
- RESERVED
- IN_PROGRESS
- COMPLETED
- CLOSED

Exception States:
- CANCELLED
- FAILED
- COMPLETED_WITH_LOSS

---

## 10. Inventory Ledger (Source of Truth)

```
inventory_ledger
- id
- tenant_id
- product_id
- process_execution_id
- direction (IN | OUT)
- quantity
- uom
- unit_cost
- total_cost
- event_type
- created_at
```

Rules:
- Append-only
- No updates
- No deletes

---

## 11. Partial Completion

Planned: 10  
Actual: 8  
Scrap: 2  

Status:
```
COMPLETED_WITH_LOSS
```

Ledger reflects actual quantities only.

---

## 12. Rework Flow

Rework is always a new process.

```
SCRAP / FAILED_ITEM → REWORK_PROCESS → FG
```

---

## 13. Tenant Rules (Config Driven)

```
{
  "deduction_event": "ON_PROCESS_COMPLETION",
  "reservation_enabled": true,
  "allow_negative_inventory": false,
  "allow_partial_completion": true
}
```

---

## 14. Reporting Supported

- Inventory valuation
- COGS
- Cost variance
- Scrap analysis
- Process efficiency
- Tenant-wise metrics

---

## 15. Recommended Build Order

1. Product + Ledger
2. Process Definition + Versioning
3. Process Execution + States
4. Cost Model
5. Rework & Scrap
6. Reporting

---

## 16. Final Note

This architecture mirrors real ERP systems (SAP / Oracle) while remaining developer-friendly and scalable.


