# TODO: Fix production error "Failed to load conversation messages"

- [ ] Add production-safe validation for `conversation._id` before calling `/messages` endpoint
- [ ] Improve error logging in `selectConversation` to include `response.status` and response body text
- [ ] Ensure the existing toast message remains unchanged: "Failed to load conversation messages"
- [ ] Run TypeScript/Next build checks

