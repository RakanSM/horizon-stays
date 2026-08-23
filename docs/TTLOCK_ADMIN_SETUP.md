# TTLock administration guide

## Purpose

Horizon Stays now has a dedicated administrator page at `/admin/locks`. It is intentionally separate from property-to-lock assignment. This first release manages the connected TTLock account as a single lock inventory and records the results of Horizon-originated actions.

> **Security rule:** do not paste the TTLock password, client secret, passcodes, or lock keys into source files, GitHub, messages, or browser notes. Enter credentials only into the protected TTLock configuration form in the Horizon administrator portal.

## One-time connection setup

| Step | Administrator action | Result |
| --- | --- | --- |
| 1 | Create or open the TTLock Open Platform application. | TTLock provides the application's **Client ID** and **Client Secret**. |
| 2 | Sign in to Horizon Stays administration and open `/admin/integrations`. | The existing **TTLock connection** panel is available. |
| 3 | Enter the Client ID, Client Secret, TTLock app account username, and TTLock app-account password. | Horizon saves the protected configuration and tests the server-side connection. |
| 4 | Open `/admin/locks` and choose **Refresh locks**. | The page loads the managed lock list from the TTLock account. |

TTLock's documented password-grant endpoint requires a Client ID, Client Secret, TTLock **app-user** account, and a lower-case MD5 password value. Horizon performs the API request only from the server-side proxy; it never returns configuration values to the locks page.[1]

## Daily operation

The locks page shows the lock alias, battery level, gateway indication, passcode format version, and access events reported by TTLock. The administrator can rename a lock, create or delete a time-bounded guest passcode, review masked prior passcodes, read recent events, and request a remote unlock.

Every door-affecting action needs a final administrator confirmation in the interface and is rejected by the server when that confirmation is absent. Existing codes and credentials are masked in the page; a newly generated code is shown once so it can be delivered through the approved guest communication channel. Remote unlocking must never be attached to an automatic booking event.

| Action | Horizon behaviour | TTLock operation |
| --- | --- | --- |
| Rename lock | Immediately reflects a confirmed name change and logs the outcome. | `v3/lock/rename` [2] |
| Create guest code | Creates a timed code only after an explicit confirmation; logs the outcome. | Keyboard passcode API |
| Delete guest code | Deletes a selected code only after an explicit confirmation; logs the outcome. | Keyboard passcode API |
| Read access events | Shows limited event information and masks credentials; logs the read. | `v3/lockRecord/list` [3] |
| Remote unlock | Sends only a confirmed manual request; logs the outcome. | `v3/lock/unlock` [4] |

## Deliberately postponed

No lock is assigned to an apartment or villa in this release. The later property-mapping step will add a verified `property → lock` relation before any booking-triggered access policy is enabled. Until then, guest codes are created manually from the selected lock and do not alter booking data.

## References

1. [TTLock Open Platform — Get access token](https://euopen.ttlock.com/doc/oauth2)
2. [TTLock Open Platform — Change lock name](https://euopen.ttlock.com/doc/api/v3/lock/rename)
3. [TTLock Open Platform — Get unlock records](https://euopen.ttlock.com/doc/api/v3/lockRecord/list)
4. [TTLock Open Platform — Unlock](https://euopen.ttlock.com/doc/api/v3/lock/unlock)
