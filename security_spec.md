# Security Specification: WhatsApp Unban & Admin Panel System

## 1. Data Invariants
- A chat message must have a valid `uid` matching the authenticated user.
- A user can only see their own `unban_requests` (list operation).
- Global notifications are readable by all but writable only by admins.
- `app_accounts` contain sensitive cleartext passwords for user login, so READ/WRITE is strictly restricted to Admins.
- `global_stats` can only be incremented via authenticated requests.

## 2. The "Dirty Dozen" Payloads (Denial Targets)

1. **Identity Spoofing**: `chat_messages` payload where `uid` is another user's ID.
2. **State Shortcutting**: Updating an `AppAccount` status from `banned` to `active` as a non-admin.
3. **Resource Poisoning**: Document IDs with > 128 characters or illegal symbols.
4. **Shadow Update**: Updating `unban_requests` and trying to change the `userId`.
5. **PII Leak**: A user trying to list all `app_accounts` or `app_users`.
6. **Self-Promotion**: A user creating a document in `admins/{uid}`.
7. **System Spoofing**: A user trying to update `global_stats/counters` directly without standard validation.
8. **Invalid Types**: Sending a string for `isVip` in `AppAccount`.
9. **No Auth Write**: Attempting to post to chat without signing in.
10. **Admin Bypass**: Trying to delete a notification as a standard user.
11. **Huge Payloads**: A message text over 1000 characters.
12. **Future Dates**: Setting a `timestamp` in the future instead of `request.time`.

## 3. The Test Runner Plan
Verify all rules reject these payloads using the Firebase Rules Simulator logic.
