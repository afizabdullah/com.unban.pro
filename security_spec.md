# Security Specification - WaRecovery Pro

## 1. Data Invariants
- **App Accounts:** Only accessible via direct query with username/password (System check) or Admin lookup.
- **Unban Requests:** Users can only create requests with their own `userId`. Only Admins can list all requests.
- **Chat Messages:** Publicly readable but only writable by the authenticated user with their correct `uid`.
- **Admin Access:** Strictly restricted to UIDs present in the `/المشرفون/` collection.

## 2. The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing:** Attempting to create a message with `uid: "attacker_id"` while logged in as `user_id`. (Expected: DENIED)
2. **Ghost Field Injection:** Adding `isVip: true` to a standard account update. (Expected: DENIED)
3. **Admin Escalation:** Attempting to write to `/المشرفون/` collection as a non-admin. (Expected: DENIED)
4. **Log Tampering:** Attempting to delete or edit an old `unban_request`. (Expected: DENIED)
5. **PII Scraping:** Trying to `list` all documents in `app_users` without an admin UID. (Expected: DENIED)
6. **Large Payload Attack:** Sending a `text` message in chat exceeding 1000 characters. (Expected: DENIED)
... (and 6 other vector tests)

## 3. Test Runner (Draft)
The `firestore.rules.test.ts` will verify that `request.auth.uid` must match `resource.data.uid` for all user-owned collections.
