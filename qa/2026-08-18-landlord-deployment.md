# Landlord deployment QA — 2026-08-18

Vercel deployment `dpl_AYYNgQqwfyaabY7YEfqJo65hX42A` is `READY`, target `production`, and carries GitHub commit `a3f105b` from `RakanSM/horizon-stays:main`. Its aliases include `horizonstay-sa.com`.

The live `https://horizonstay-sa.com/admin` and `/landlord` routes return HTTP 200 from Vercel and the landlord page loads the current Arabic login screen. The user-provided landlord code was entered successfully in the live login form. Multiple submit attempts did not leave the login screen; this indicates a live landlord RPC/authentication issue that requires correction before claiming end-to-end login verification.
