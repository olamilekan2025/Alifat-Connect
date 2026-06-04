# TODO - Fix electricity page orange branding

- [ ] Restore/repair `src/app/dashboard/electricity/page.tsx` JSX structure (it is currently broken due to earlier edits).
- [ ] After it builds again, replace Tailwind color utilities:
  - `from-amber-500` -> `from-orange-500`
  - `bg-gradient-to-r from-amber-500 ...` -> `... from-orange-500 ...`
  - `shadow-amber-500/...` -> `shadow-orange-500/...`
  - `border-amber-500/...` -> `border-orange-500/...`
  - `bg-amber-500/...` -> `bg-orange-500/...`
  - Keep other non-gradient colors unchanged unless they are part of the gold→orange scheme.
- [ ] Confirm with `search_files` that `from-amber-500` and `amber-500` are gone from the electricity page.
- [ ] Run `npm run lint` and/or `npm run build`.

