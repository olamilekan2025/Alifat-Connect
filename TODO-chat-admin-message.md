# TODO - Admin chat: sender name shows but message not showing

- [ ] Update socket message emission to send plain/lean message object
  - File: `src/lib/socket/server.ts`
  - Ensure emitted `message:new` payload includes consistent fields (`createdAt`, `senderId`, `senderRole`, `isRead`, `attachment`)

- [ ] (After deploy) Smoke test:
  - Admin sends a message in an open conversation; verify it appears in admin MessageList.
  - Customer sends a message; verify it appears in admin MessageList too.

