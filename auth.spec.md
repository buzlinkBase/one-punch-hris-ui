# RBAC Specification (Conceptual / Functional)

## 1. Purpose & Scope

Define a Role-Based Access Control (RBAC) model that governs _who can do what_ inside the product, aligned with the industry-standard NIST RBAC model (Users → Roles → Permissions), extended to support the product's specific structure: **Roles → Features → Actions**.

This document intentionally excludes data entities, schemas, and API contracts — it defines the **conceptual model, terminology, rules, and future extension points** only.

Out of scope for this phase (but designed for): Plan/Subscription-based feature entitlement.

---

## 2. Core Concepts (Standard RBAC Terminology)

| Term                               | Definition                                                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**                           | An individual identity that logs into the system.                                                                                                                   |
| **User Type**                      | A classification of the user's relationship to the org (Employee, External Auditor, Payroll Master, etc.)                                                           |
| **Role**                           | A named collection of permissions representing a job function (e.g., "HR Manager", "Auditor - Read Only").                                                          |
| **Feature / Module**               | A functional area or form/screen in the product (e.g., "Payroll", "Employee Records", "Leave Requests"). This is the standard **"Resource"** in classic RBAC terms. |
| **Action**                         | An operation that can be performed on a Feature (e.g., View, Create, Edit, Delete, Approve, Export). This is the standard **"Permission"** in classic RBAC terms.   |
| **Permission**                     | The pairing of a Feature + Action (e.g., `Payroll:Approve`). This is the atomic unit of access.                                                                     |
| **Role Assignment**                | The link between a User and one or more Roles.                                                                                                                      |
| **Plan / Subscription** _(future)_ | A commercial tier that determines which Features are even available to an organization, regardless of role.                                                         |
| **Entitlement** _(future)_         | Whether a Feature is unlocked for the org's current Plan — separate concept from _permission_, which governs whether a specific user can use it.                    |

**Golden rule (industry standard):**

> A user can only perform an action on a feature if **(a)** their organization's Plan entitles that Feature, **AND** **(b)** their Role grants that Action on that Feature.

This two-layer separation (Entitlement vs. Permission) is the standard pattern used by mainstream SaaS products (Salesforce, Atlassian, Microsoft 365, Zoho) and is why we're designing for it now even though Plans come later — bolting entitlements onto RBAC after the fact usually forces a rework.

---

## 3. Hierarchy Model

```
Organization
 └── Users
      └── assigned one or more Roles
           └── each Role grants a set of Feature Permissions
                └── each Feature Permission = Feature + allowed Actions
```

Key design decisions:

- **Many-to-many, User ↔ Role.** A user can hold multiple roles simultaneously (e.g., an employee who is also a payroll approver). Effective permissions = union of all assigned roles' permissions. This is the market-standard approach (vs. one-role-per-user, which doesn't scale past small teams).
- **Many-to-many, Role ↔ Feature-Action.** A role bundles any combination of feature+action pairs; the same feature can appear in many roles with different action sets.
- **Deny by default.** If a permission isn't explicitly granted, it's denied. No implicit access.

---

## 4. User Types (Actor Model)

User Type is a **classification attribute on the user**, not itself a permission mechanism — actual access still flows through assigned Roles. The distinction matters for:

- **Scoping** (e.g., External Auditors should default to read-only, cross-department visibility but no write actions anywhere; Payroll Master needs elevated, narrowly-scoped access to payroll features only).
- **Onboarding/offboarding rules** (external auditors typically need time-bound access; employees follow the standard HR lifecycle).
- **Compliance/reporting** (auditors often need a way to review "who had access to what and when" — the User Type helps segment this in reports later).

Initial User Types:

| Type             | Typical Access Pattern                                                                 |
| ---------------- | -------------------------------------------------------------------------------------- |
| Employee         | Role(s) scoped to their function/department                                            |
| External Auditor | Time-bound, mostly read-only, cross-cutting visibility into records for audit purposes |
| Payroll Master   | Elevated access, but scoped tightly to payroll-related features/actions                |

This list should be **extensible** — new user types (e.g., Contractor, Vendor, System/Service Account) will come up; the model shouldn't hardcode logic against a fixed enum of types.

---

## 5. Features & Actions

### 5.1 Features

A Feature represents a functional module or form in the product — the same granularity users see in the navigation/menu (e.g., "Leave Management", "Payroll Runs", "Employee Directory", "Reports").

Features can optionally be **grouped under a Module** for organizing large role-permission matrices in the UI (this becomes important once you have 50+ features — flat lists get unmanageable).

### 5.2 Actions

Actions should follow a **standard, reusable verb set** rather than being invented per-feature, so permission matrices stay consistent and predictable across the product. Market-standard action verbs:

| Action  | Meaning                                                                            |
| ------- | ---------------------------------------------------------------------------------- |
| View    | Read-only access to the feature/data                                               |
| Create  | Add new records                                                                    |
| Edit    | Modify existing records                                                            |
| Delete  | Remove records                                                                     |
| Approve | Sign off on a workflow step (e.g., approve payroll run, approve leave)             |
| Export  | Download/export data out of the system                                             |
| Import  | Bulk upload data into the system                                                   |
| Manage  | Administrative control over the feature's configuration (superset, used sparingly) |

Not every feature needs every action — a feature exposes only the subset of actions relevant to it (e.g., "Employee Directory" may only need View/Export; "Payroll Runs" may need View/Create/Approve/Export).

**Custom actions** should be allowed per feature (e.g., "Reopen", "Reverse", "Lock Period") but should be treated as extensions of this base set, not a free-for-all — keeps the permission matrix legible.

---

## 6. Roles

### 6.1 Role Types

Market-standard products distinguish between:

- **System/Default Roles** — pre-built, non-deletable (e.g., "Super Admin", "Read Only"). Ships with the product; guarantees there's always at least one usable admin role.
- **Custom Roles** — created by the org's admin, fully configurable Feature+Action combinations.

### 6.2 Role Composition

Each role = a name + description + a set of (Feature, [Actions]) pairs.

### 6.3 Role Hierarchy (recommended, common in mature RBAC systems)

Optionally support **role inheritance** (a role can extend a base role and add/override permissions) — reduces duplication when many roles share a common baseline (e.g., "Senior HR Manager" = "HR Manager" + extra Approve actions). This is optional for v1 but worth reserving conceptually so it's not a breaking change later.

### 6.4 Scope of a Role

Consider whether a role's grant applies:

- **Globally** across the org, or
- **Scoped** to a department/branch/cost-center (common need for larger orgs — e.g., "HR Manager" for APAC region only)

Recommend designing the permission model to carry an optional scope dimension even if v1 only implements global scope — retrofitting scoping later is disruptive.

---

## 7. Effective Permission Resolution

When checking "can this user do X on Feature Y":

1. Resolve all Roles assigned to the user.
2. Union all (Feature, Action) grants across those roles.
3. _(Future)_ Intersect with the org's active Plan entitlements for that Feature — if the Plan doesn't include the Feature, access is denied regardless of role.
4. If the resulting set includes (Y, X) → allow. Otherwise → deny.

This ordering (Role permissions ∪, then Plan entitlement ∩) is the standard layering used in tiered SaaS products and keeps the two systems decoupled — Plans can change without needing to touch role definitions, and vice versa.

---

## 8. Plan / Subscription Layer (Future — Designed For, Not Built Now)

- A **Plan** lists which **Features** are unlocked for an organization (Plan ↔ Feature, many-to-many).
- This is an **entitlement gate**, sitting _above_ RBAC, not a replacement for it. Even on the highest plan, a user still needs role-based permission to act on a feature.
- Recommended behavior when a Plan downgrade removes a Feature the org was using: existing role configurations referencing that feature should be preserved (not deleted) but simply become inert/hidden until the Feature is re-entitled — avoids silent data loss on downgrade, which is a common support headache in SaaS products.
- Should support **trial/grace period** and **feature-level upsell** hooks eventually (e.g., "Approve" action grayed out with an upgrade prompt) — common pattern, worth keeping in mind for UI design later even though it's out of scope now.

---

## 9. Governance & Best Practices to Bake In

- **Principle of Least Privilege** — default/new roles start empty; access is explicitly granted, never assumed.
- **Audit Trail** — every role creation/edit, and every role assignment/removal to a user, should be logged with actor + timestamp (critical for the External Auditor and Payroll Master user types specifically, and generally expected in any compliance-adjacent product).
- **Segregation of Duties** — flag potentially risky combinations at the role-design stage (e.g., a single role having both "Create Payroll Run" and "Approve Payroll Run" defeats maker-checker controls). Not necessarily hard-blocked in v1, but worth surfacing as a warning.
- **Time-bound access** — particularly relevant for External Auditors; role assignments should support an optional expiry so access doesn't linger after an audit engagement ends.
- **No orphaned access** — when a role is deleted, decide explicitly whether assigned users lose access immediately or fall back to a default role, rather than leaving it undefined.

---

## 10. Summary of Design Principles Carried Forward

1. Two-layer model from day one: **Role-based Permissions** (who can do what) and **Plan-based Entitlements** (what's even available) — kept as separate, composable systems.
2. Standardized, reusable **Action vocabulary** rather than free-text per feature.
3. **Many-to-many** at every junction (User↔Role, Role↔Feature-Action, Plan↔Feature) — matches how every mature RBAC product in market actually behaves.
4. **User Type** as a classification/default-scoping attribute, not a hardcoded access mechanism.
5. Reserved (but not mandatory for v1) hooks for **role hierarchy** and **scoped roles**, since both are common asks once the org grows past a certain size.
