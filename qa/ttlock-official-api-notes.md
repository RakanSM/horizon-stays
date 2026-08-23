# TTLock official API notes — 2026-08-23

The TTLock Open Platform requires an application `clientId` and account `accessToken` for lock operations. The official token endpoint also requires the application client secret and a TTLock app account whose password is sent as a lower-case MD5 value. The current Horizon implementation must not ingest or record account credentials from chat; configuration belongs in the protected admin setup only.

| Horizon action | Official TTLock operation | Safety rule |
| --- | --- | --- |
| Refresh the managed-lock page | `POST /v3/lock/list` and per-lock detail | Read-only; safe to refresh on administrator request. |
| Update a lock label | `POST /v3/lock/rename` with `lockAlias` | Only after an explicit administrator save; record outcome. |
| Inspect activity | `POST /v3/lockRecord/list` | Read-only; render the minimum required event data. |
| Issue, delete, or remotely unlock | Passcode or unlock operations | Never automatic; require an explicit administrator action and record the outcome. |

The dedicated lock detail response may contain sensitive lock material. The Horizon page must use the safe lock-list fields and must not display or persist details such as lock keys, administrator codes, super passcodes, or AES keys.

## References

1. [TTLock — Get access token](https://euopen.ttlock.com/doc/oauth2)
2. [TTLock — Get lock list](https://euopen.ttlock.com/doc/api/v3/lock/list)
3. [TTLock — Change lock name](https://euopen.ttlock.com/doc/api/v3/lock/rename)
4. [TTLock — Get unlock records](https://euopen.ttlock.com/doc/api/v3/lockRecord/list)
5. [TTLock — Get lock details](https://euopen.ttlock.com/doc/api/v3/lock/detail)
