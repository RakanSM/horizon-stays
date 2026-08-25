# Trust certificate preview — 2026-08-24

The local Horizon preview loaded with the violet live-availability indicator visible in the hero. The long public page did not move to its footer through the connected browser scroll command, so footer and popup interaction will be verified after deployment using direct browser inspection. Automated tests and production build are the current verification baseline for the new non-interactive commercial-registration text, trust trigger, certificate number, and edited certificate image.

The preview's rendered text contains the separate footer sequence “السجل التجاري: 7050485445. ✓. موثّق.” This confirms the commercial registration is rendered as text and the verification label is a distinct control, rather than making the registration number interactive.

Production verification: the Vercel deployment for commit `c73cfd7` reached `READY`. The live apex domain renders the corresponding English footer sequence “CR No. 7050485445. ✓. Verified.” The registration is plain rendered text and the verified label remains a separate control.
