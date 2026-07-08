# TODO (Notification Fixes)

## Step 1
- Fix Pusher realtime wiring mismatch: bind NotificationContext to the correct event name(s) used by NotificationService. ✅

## Step 2
- Normalize notification `type` between DB model and UI. ✅
  - Update NotificationContext.NotificationItem.type to align with `NotificationType` (signup/login/transfer/etc.) or map DB types to UI categories.
  - Update NotificationDropdown to handle the final type values.


## Step 3
- Ensure live notification triggers match realtime listeners. ✅
- Implement correct emit triggers for required business events:
  - user signup
  - user login
  - user purchase/transaction
- Ensure both admin dashboard and user receive notifications as requested.

## Step 4
- Update `/api/notifications` to return only notifications relevant to the current authenticated principal.

## Step 5
- Add/verify `/api/notifications/[id]/read` and any mark-all endpoints for the relevant principal scope.

## Step 6
- Run build/lint/tests (if configured) to ensure everything compiles.

