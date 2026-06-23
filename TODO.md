# TODO - Admin Settings Premium Page

## Completed
- [x] Added `AdminSettings` model: `src/models/AdminSettings.ts`
- [x] Added admin settings API: `src/app/api/admin/settings/route.ts`
- [x] Added admin audit logs API (searchable): `src/app/api/admin/audit-logs/route.ts`
- [x] Added premium admin settings page UI: `src/app/admin-dashboard/settings/page.tsx`

## Next (recommended)
- [ ] Implement missing endpoints for Maintenance & Backup buttons (clear cache, rebuild indexes, restart jobs, create/download backup, restore).
- [ ] Implement full Admin Profile actions (change password, 2FA enable/disable, last login writeback).
- [ ] Hook Security settings into authentication flow (email verification enforcement, rate limiting, session timeout, password policy, etc.).
- [ ] Hook Payment/Email/Notification settings into runtime services (wallet rules, nodemailer/smtp, notifications).
- [ ] Add Audit logging writes for admin actions (POST) from maintenance/backup/settings/other admin pages.
- [ ] Ensure audit log document includes required fields (ip, status, target resource) when logging.
- [ ] Run `npm test`/`npm run build` (or `npm run lint`) and fix TypeScript/ESLint errors if any.

