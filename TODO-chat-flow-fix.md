# TODO - Chat flow production fix: "Failed to load conversation messages"

## Plan step list
1. Update `src/context/ChatContext.tsx` to make `selectConversation` more robust in production.
2. Add validation for `conversation._id` before calling `/messages` endpoint.
3. If `_id` invalid or request fails: retry by reloading conversations and re-selecting / resolving the correct conversation.
4. Improve diagnostics: log HTTP status and raw response body when available.
5. Ensure we only load messages when session status is `authenticated`.
6. Run typecheck/lint and (if possible) a production-like build test.

