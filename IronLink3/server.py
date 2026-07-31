"""Loopback HTTP interface for the IronLink3 unified control room."""

from __future__ import annotations

import hmac
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from control_plane import ControlPlane, secure_token_configured


ROOT = Path(__file__).resolve().parent
PLANE = ControlPlane()
OWNER_TOKEN = os.getenv("IRONLINK3_OWNER_TOKEN", "")
MAX_BODY = 16_384


class Handler(BaseHTTPRequestHandler):
    server_version = "IronLink3Control/1.0"

    def log_message(self, fmt: str, *args) -> None:
        return

    def _json(self, status: int, payload: object) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
        self.end_headers()
        self.wfile.write(body)

    def _authorized(self, mutate: bool = False) -> bool:
        supplied = self.headers.get("Authorization", "")
        expected = "Bearer " + OWNER_TOKEN
        if not secure_token_configured(OWNER_TOKEN) or not hmac.compare_digest(supplied, expected):
            self._json(401, {"error": "owner authorization required"})
            return False
        if mutate and not PLANE.nonces.accept(self.headers.get("X-Request-Nonce", "")):
            self._json(409, {"error": "fresh request nonce required"})
            return False
        return True

    def _body(self) -> dict:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ValueError("invalid content length") from exc
        if length < 0 or length > MAX_BODY:
            raise ValueError("request body too large")
        if not length:
            return {}
        value = json.loads(self.rfile.read(length).decode("utf-8"))
        if not isinstance(value, dict):
            raise ValueError("JSON object required")
        return value

    def do_GET(self) -> None:
        if self.path == "/":
            body = (ROOT / "static" / "index.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'")
            self.end_headers()
            self.wfile.write(body)
            return
        if not self._authorized():
            return
        if self.path == "/api/status":
            self._json(200, PLANE.status())
        elif self.path == "/api/ledger":
            self._json(200, {"valid": PLANE.ledger.verify(), "entries": PLANE.ledger.entries()})
        else:
            self._json(404, {"error": "route not found"})

    def do_POST(self) -> None:
        if not self._authorized(mutate=True):
            return
        try:
            body = self._body()
            if self.path == "/api/verify":
                self._json(200, PLANE.verify())
            elif self.path == "/api/checkpoint":
                self._json(200, PLANE.create_checkpoint())
            elif self.path == "/api/heal":
                self._json(200, PLANE.heal(str(body.get("module_id", ""))))
            elif self.path == "/api/ironlink3/connect":
                status = PLANE.connect_ironlink3()
                self._json(200 if status["connected"] else 503, status)
            else:
                self._json(404, {"error": "route not found"})
        except (ValueError, KeyError, RuntimeError, json.JSONDecodeError) as exc:
            self._json(400, {"error": str(exc)})


def main() -> None:
    if not secure_token_configured(OWNER_TOKEN):
        raise SystemExit("Set IRONLINK3_OWNER_TOKEN to a strong token of at least 24 characters.")
    host = os.getenv("IRONLINK3_BIND", "127.0.0.1")
    if host not in {"127.0.0.1", "::1", "localhost"}:
        raise SystemExit("Remote binding is disabled; place an authenticated TLS reverse proxy in front.")
    port = int(os.getenv("IRONLINK3_PORT", "7123"))
    print(f"IronLink3 Unified Control Room: http://{host}:{port}")
    ThreadingHTTPServer((host, port), Handler).serve_forever()


if __name__ == "__main__":
    main()
