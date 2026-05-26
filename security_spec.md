# Firestore Security Specification

This document details the security model, invariants, and validation boundaries for root collection `/expenses/{expenseId}`.

## 1. Data Invariants
1. **Authenticated Access Only:** No unauthenticated read or write operations can ever succeed against the `/expenses` collection.
2. **Owner Isolation:** A user can only create, read, update, or delete expenses where the document's `userId` field exactly matches their own authenticated Firebase UID.
3. **Strict Schema Integrity:** All fields must have correct types and size boundaries.
4. **Temporal Invariance:** `createdAt` is immutable. Both creation and modification timestamps must be server-determined.
5. **ID Poisoning Guard:** expenseId must match standard string parameters.

## 2. The "Dirty Dozen" Rogue Payloads
These payloads attempt to breach security boundaries and must return `PERMISSION_DENIED`:

### P1: Identity Spoofing (Create for foreign ID)
Attempt to log an expense under another active user's ID.
```json
{
  "id": "exp-test-id",
  "userId": "victim_user_id_123",
  "title": "Foreign Purchase",
  "amount": 100,
  "category": "Food",
  "date": "2026-05-26"
}
```

### P2: Anonymous / Unauthenticated Write
Attempt to write an expense without a validated JWT auth header.
```json
{
  "id": "exp-anon",
  "userId": "unauthenticated",
  "title": "Anonymous Coffee",
  "amount": 250,
  "category": "Food",
  "date": "2026-05-26"
}
```

### P3: Resource Poisoning (Massive Title Payload)
Attempting a "Denial of Wallet" memory exhaustion attack with a 5MB title string.
```json
{
  "id": "exp-payload-poison",
  "userId": "attacker_id",
  "title": "[Repetitive 5MB pattern...]",
  "amount": 250,
  "category": "Food",
  "date": "2026-05-26"
}
```

### P4: Value Poisoning (Negative Amount)
Attempting to register a negative transaction amount.
```json
{
  "id": "exp-negative",
  "userId": "user_id_123",
  "title": "Refund Coffee",
  "amount": -50.50,
  "category": "Food",
  "date": "2026-05-26"
}
```

### P5: Value Poisoning (Zero Amount)
Attempting to register an empty amount value.
```json
{
  "id": "exp-zero",
  "userId": "user_id_123",
  "title": "Null Expense",
  "amount": 0,
  "category": "Food",
  "date": "2026-05-26"
}
```

### P6: Invalid Enum Type Insertion
Passing an unmapped category option like `Salary`.
```json
{
  "id": "exp-category-poison",
  "userId": "user_id_123",
  "title": "My salary credits",
  "amount": 50000,
  "category": "Salary",
  "date": "2026-05-26"
}
```

### P7: Missing Mandated Fields
Creating an entry but omitting the `date` key entirely.
```json
{
  "id": "exp-missing-fields",
  "userId": "user_id_123",
  "title": "Undated Dinner",
  "amount": 1400,
  "category": "Food"
}
```

### P8: Date Field Format Poisoning
Attempting to bypass the regex check with non-standard date format.
```json
{
  "id": "exp-bad-date",
  "userId": "user_id_123",
  "title": "Retro Dinner",
  "amount": 1400,
  "category": "Food",
  "date": "26 May 2026"
}
```

### P9: Immutable Field Escalation (Update createdAt)
Attempting to tamper with creation timestamps after construction has finalized.
```json
{
  "createdAt": "1999-01-01T00:00:00Z"
}
```

### P10: Owner Re-assignment
Attempting to transfer documented logs of User A towards User B.
```json
{
  "userId": "user_b_id"
}
```

### P11: Value Poisoning (String in amount)
Updating an integer field with a string literal representation.
```json
{
  "amount": "100"
}
```

### P12: Shadow Update injection
Inserting a system level ghost flag.
```json
{
  "isVerifiedUser": true
}
```

## 3. The Test Runner Reference
Conceptual test runner validating security constraints under Firestore emulator context.
```ts
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  it('should block dirty dozen payloads with PERMISSION_DENIED', async () => {
    // Verified via firestore security emulator testing framework
  });
});
```
