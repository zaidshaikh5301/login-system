# Login System — Changelog

## What changed

### Bug fixes
1. **Validation no longer triggers on page load** — errors only appear on `blur` (after the field is touched) and on `submit`.
2. **"Password is required" logic fixed** — the check now correctly reads the input value; errors clear as soon as the field becomes valid.
3. **Strength meter label unclipped** — the "Weak/Fair/Good/Strong" text now sits below the progress bar with dedicated spacing and no overlap.
4. **Show/hide toggle moved inside the password input** — it is a `<button type="button">`, right-aligned and vertically centered, with `aria-label` and `aria-pressed`.
5. **Typo fixed** — "Forgt password?" is now "Forgot password?".
6. **Card fits the viewport** — `min-height: 100dvh`, centered flex layout, proper padding; works from 320px upward.
7. **Helper text replaced on error** — the email hint fades out when a field error is shown, instead of stacking with it.

### Validation & UX additions
- Email: regex check with messages "Email is required" and "Enter a valid email like name@company.com."
- Password: minimum 8 characters plus a live checklist (uppercase, lowercase, number, symbol) that ticks off as you type.
- Strength meter: 4 levels (Weak / Fair / Good / Strong), color-coded, animated bar, label below the bar.
- Submit button disabled until the form is valid.
- Loading spinner + "Signing in..." during a simulated 1.5s API call.
- Success state banner and error banner for wrong credentials (mock credentials: `user@company.com` / `Password123!`).
- Caps Lock warning under the password field.
- Enter key submits; auto-focuses the first invalid field on failed submit.
- "Remember me" saves the email to `localStorage` (password is never stored).
- Form locks for 30 seconds after 5 failed attempts, with a countdown.

### Design
- Dark navy theme retained; improved spacing, typography hierarchy, and visible `:focus-visible` focus rings.
- Smooth transitions on inputs, error messages (slide/fade), and button hover.
- Subtle shake animation on invalid submit.
- "Continue with Google / GitHub" buttons with an "or continue with" divider.
- Optional light/dark toggle using CSS variables and `prefers-color-scheme`.

### Accessibility
- Proper `<label for>`, `aria-invalid`, `aria-describedby`, and `role="alert"` on error messages.
- Full keyboard navigation, 4.5:1 color contrast targets, `prefers-reduced-motion` respected.
- Correct `autocomplete` attributes (`email`, `current-password`) and input types.

### Code quality
- Clean, commented, modular JavaScript in `script.js` (separate functions for validation, UI updates, and submit handling).
- No inline styles; CSS variables for colors; mobile-first responsive design.

## Files
- `index.html` — markup
- `style.css` — styling
- `script.js` — client logic
- `favicon.svg` — site icon

## Mock credentials (for testing)
- Email: `user@company.com`
- Password: `Password123!`
