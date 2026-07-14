# TODO-chat-flow-fix

## Step 1 (done)
- Switch Socket.IO registration to a single source of truth (src/lib/socket/server.ts).


## Step 2 (done)
- Add `conversation:list` Socket.IO event to the chosen socket server.
  - Users: return their conversations.
  - Admin: return all conversations.


## Step 3
- Update ChatContext to load conversations via socket (`conversation:list`) instead of only via REST.

## Step 4
- Ensure message flow remains:
  - message:send -> save Message -> update Conversation unread counts -> save Notification -> emit message:new + notification:new + conversation:update.

## Step 5
- Verify typing + read receipts payloads still work after server switch.

