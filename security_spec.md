# Security Spec for Public Chat Room

## Data Invariants
1. A message cannot exist without a valid `uid` that belongs to the user (`request.auth.uid`).
2. The `text` field must be a string <= 500 characters.
3. The `senderName` field must be a string <= 50 characters.
4. The `visibility` field must be exactly `'public'`.
5. The `timestamp` must be `request.time`.
6. Only signed-in users (including anonymous) can read messages where `visibility == 'public'`.

## The "Dirty Dozen" Payloads
1. Empty payload
2. Missing `uid`
3. Spoofed `uid` (different from `request.auth.uid`)
4. Invalid `text` type (e.g., number)
5. Overly long `text` (1MB payload)
6. Missing `senderName`
7. Missing `visibility`
8. Custom `visibility` (e.g., 'private')
9. Client-provided timestamp
10. Payload with extra ghost field (`isAdmin: true`)
11. Update attempt (not allowed)
12. Read attempt on `visibility != 'public'`

