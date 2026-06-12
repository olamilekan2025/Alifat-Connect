# TODO

- [x] Fix `/api/contact` to correctly parse `multipart/form-data` from `src/app/contact/page.tsx` (use `request.formData()` instead of `request.json()`).

- [ ] Align API response + validation with expected frontend behavior.
- [ ] (Optional) Persist or ignore `category` and uploaded `file` safely.
- [ ] Run `npm run dev` and verify contact submission (with and without attachment) no longer throws the console error.

