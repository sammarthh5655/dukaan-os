# Login/sign-up audit and author-requested integration

Requested 12 September 2026 while BUILD-12 was in progress. This is an explicit addition to the upcoming acceptance criteria, not a claim that online authentication has shipped.

## Current implementation

`js/auth.js` implements local username/password sign-up, sign-in, sign-out, password changes, account deletion, salted password hashing, session expiry and failed-attempt delays. `js/app.js` contains login/sign-up screens. Login is off by default; Settings offers **Turn on login**, which creates an owner account and carries the existing local shop into its namespace. The settings flow explicitly explains that there is no forgot-password recovery.

These accounts exist in this browser only. They are not email-verified online identities, cannot sign in to the same shop on another device and do not provide a trusted server authorization boundary. No online provider registration, email verification, password reset or social sign-in is currently integrated. Do not rename the existing local gate to imply those capabilities.

Prior browser regression coverage created an account through the application API, then used the actual login/PIN screens. BUILD-13 adds `tests/browser-core-accessibility.cjs`: actual Settings registration, confirmation error, retained shop, front-door duplicate registration, Hindi login, logout/login and keyboard/PIN correction in both storage modes. Native-language and assistive-technology review remain separate.

## Accepted sprint scope

- **BUILD-13 / VERIFY-13:** make local versus online account status clear in the shell, settings and sign-up/login UI; exercise the actual local sign-up form, password confirmation/duplicate-name errors, retained existing shop, sign-out and sign-in, including Hindi and keyboard navigation. Keep offline use available. No cloud or recovery claim until a backend exists.
- **BUILD-19 / VERIFY-19:** integrate provider-backed email/password registration, email verification, sign-in/out, expired-session renewal and password-reset flows against a local/emulated provider, together with shop/store membership and direct server authorization checks. Test duplicate sign-up, invalid/expired/reused verification and reset links, disabled/removed users, wrong-shop access and cancellation. Email delivery in tests stays in a local mail sink; real delivery/deployment is a separate configuration and release gate.
- Keep current offline books intact. Linking an existing local shop to an online identity must be explicit; neither a matching username/email nor a local role is authority to upload or take ownership of a shop. Cloud data synchronization remains BUILD-20–25.

The user confirmed no specific provider and delegated the choice on 12 September 2026. Retain Postgres/Supabase from D08 for the planned online account integration, subject to local proof of the provider configuration. No provider account, paid resources, real emails or production secrets are required by this planning change. If the combined identity slice exceeds the existing size limit, split its build/verify cards and regenerate all affected seam ownership before implementation.
