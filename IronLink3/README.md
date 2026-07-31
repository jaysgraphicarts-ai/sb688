# IronLink3 Unified Control Room

One owner-facing control plane for the Stitch Brick technology family.

SB-699 is attached as the local braided recovery service under `../SB699` in
the repository. The control plane registers it as local and healthy only after
its own verification tests pass; applying a captured setback to an external
workload remains an explicit operator/integration responsibility.

This build is deliberately fail-closed. It does **not** claim that IronLink3 is
connected until a real HTTPS endpoint and owner token are configured and a
signed handshake succeeds.

## Start

```powershell
$env:IRONLINK3_OWNER_TOKEN = "replace-with-a-long-random-token"
python .\server.py
```

Open `http://127.0.0.1:7123`. The server binds to loopback by default.

Optional live IronLink3 connection:

```powershell
$env:IRONLINK3_ENDPOINT = "https://your-ironlink3-host"
$env:IRONLINK3_SHARED_SECRET = "replace-with-the-link-secret"
python .\server.py
```

The remote gateway must expose `GET /v1/handshake` and return JSON containing
`{"name":"ironlink3","protocol":"sb-stitch/1"}`. The request is signed with
`X-Stitch-Timestamp` and `X-Stitch-Signature` (HMAC-SHA256).

## Owner commands

- `GET /api/status` — unified module and IronLink3 health
- `GET /api/ledger` — append-only audit entries
- `POST /api/verify` — run control-plane verification
- `POST /api/checkpoint` — promote current verified state
- `POST /api/heal` — restore a degraded registered module
- `POST /api/ironlink3/connect` — perform the signed remote handshake

All `/api/*` routes require `Authorization: Bearer <owner token>`. Mutating
routes also require `X-Request-Nonce`; replayed nonces are rejected.

## Verify

```powershell
python -m unittest discover -s tests -v
```

This is a control-plane foundation, not proof that external systems listed in
the registry are already deployed. A module marked `declared` is documented;
`local` means implemented in this package; `external` requires a verified
adapter.
