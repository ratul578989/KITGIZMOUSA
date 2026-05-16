# Security Specification - KIT GIZMO

## Data Invariants
1. A user's `totalBalance` can only be increased by an Admin (via Deposit approval or manual override).
2. A user's `totalPayout` can only be increased by an Admin (via Payout approval).
3. A user cannot update their own `isAdmin` status.
4. Deposits, Payouts, and Orders must always reference the currently authenticated user's ID unless the requester is an Admin.
5. All sensitive collection writes (Admin only) must verify the requester's admin status.

## The "Dirty Dozen" Payloads (Deny Targets)
1. User A tries to update their own `totalBalance` to $1,000,000.
2. User A tries to update their `isAdmin` flag to `true`.
3. User A tries to set their `status` to `Active` if they were `Suspended`.
4. User A tries to create a Deposit request with status `Approved`.
5. User A tries to create a Payout request for User B.
6. User B tries to read User A's profile.
7. User A tries to update an Order price to $0.
8. Unauthenticated user tries to read any collection.
9. User A tries to set their `totalPayout` manually.
10. User A tries to delete another user's deposit request.
11. User A tries to inject a 10MB string into the `fullName` field.
12. User A tries to change the `serviceName` of an existing order.

## Test Matrix
| Operation | Path | Auth | Expect |
|-----------|------|------|--------|
| Create | /users/uid | Owner | Allow (Initial registration) |
| Update sensitive | /users/uid | Owner | Deny |
| Update name | /users/uid | Owner | Allow |
| Create Deposit | /deposits/id | Owner | Allow (Pending only) |
| Approve Deposit| /deposits/id | User | Deny |
| Approve Deposit| /deposits/id | Admin | Allow |
| List Users | /users | User | Deny |
| List Users | /users | Admin | Allow |
