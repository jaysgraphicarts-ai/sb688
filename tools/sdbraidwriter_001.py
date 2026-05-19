#!/usr/bin/env python3
"""
SDBRAIDWRITER-001 — SB688 MicroSD Braided Topology Rewriter

This tool rewrites a mounted microSD card path into a safe SB688 braided topology
file-system packet. It does not physically alter microSD hardware.

Default mode is dry-run. Use --write to actually create files.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

FORBIDDEN_NAMES = {
    ".git",
    "windows",
    "program files",
    "program files (x86)",
    "users",
    "system32",
}

LAYOUT = {
    "00_READ_FIRST": {
        "README.txt": "SB688 braided topology card packet. This card is a physical access packet, not the secure backend.\n",
        "OWNER_INSTRUCTIONS.txt": "Scan the QR/login route, authenticate, then let STITCH verify the backend Memory Chip binding.\n",
    },
    "01_ACCESS_KEY": {
        "public_card_id.txt": "{public_card_id}\n",
        "qr_route.txt": "{qr_route}\n",
        "access_manifest.json": None,
    },
    "02_STITCH_HANDSHAKE": {
        "stitch_route.json": None,
        "handshake_rules.json": None,
    },
    "03_MEMORY_LINK": {
        "memory_chip_pointer.json": None,
        "no_raw_secrets.txt": "No raw passwords, service role keys, tokens, or private Memory Chip contents belong on this card.\n",
    },
    "04_CLIP_BRICKS": {
        "approved_bricks.json": None,
    },
    "05_AVA_ROOM": {
        "ava_start_here.txt": "AVA opens only after CLIPPERX + STITCH verify the business room.\n",
        "room_rules.json": None,
    },
    "06_SHIELD": {
        "shield_rules.json": None,
        "blocked_items.txt": "Blocked: raw secrets, private memory, payment secrets, unencrypted client DB, private ledgers.\n",
    },
    "07_CHIPFORGE": {
        "card_program_manifest.json": None,
        "rewrite_history.jsonl": "",
    },
    "08_RESTORE": {
        "restore_manifest.json": None,
        "recovery_instructions.txt": "Replacement cards must receive a new binding and ledger event.\n",
    },
    "09_LEDGER": {
        "card_ledger.jsonl": "",
        "card_manifest.sha256": "",
    },
    "10_EXPORTS": {
        "encrypted_exports_only.txt": "Only encrypted exports belong here.\n",
    },
    "11_MEDIA_KIT": {
        "put_brand_files_here.txt": "Put approved brand/media files here. Do not place secrets here.\n",
    },
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def verify_target(target: Path) -> None:
    resolved = target.resolve()
    parts = {part.lower() for part in resolved.parts}
    if any(name in parts for name in FORBIDDEN_NAMES):
        raise SystemExit(f"BLOCKED: target path looks unsafe: {resolved}")
    if resolved == Path(resolved.anchor):
        raise SystemExit("BLOCKED: refusing to write to drive root anchor without a folder.")
    if not target.exists():
        raise SystemExit(f"BLOCKED: target path does not exist: {target}")
    if not target.is_dir():
        raise SystemExit(f"BLOCKED: target path is not a directory: {target}")


def build_manifest(args: argparse.Namespace) -> dict[str, Any]:
    approved_bricks = [b.strip() for b in args.approved_bricks.split(",") if b.strip()]
    packet = {
        "brick_id": "SDBRAIDWRITER-001",
        "system": "SB688 / SB689",
        "created_at": utc_now(),
        "public_card_id": args.public_card_id,
        "business_room_id": args.business_room_id,
        "memory_chip_id": args.memory_chip_id,
        "qr_route": args.qr_route,
        "industry": args.industry,
        "approved_bricks": approved_bricks,
        "secrets_policy": "no raw secrets on card",
        "topology": "braided_file_system_packet",
    }
    packet["manifest_hash"] = sha256_text(json.dumps(packet, sort_keys=True))
    return packet


def content_for(folder: str, filename: str, manifest: dict[str, Any]) -> str:
    if filename == "access_manifest.json":
        return json.dumps({
            "public_card_id": manifest["public_card_id"],
            "business_room_id": manifest["business_room_id"],
            "qr_route": manifest["qr_route"],
            "manifest_hash": manifest["manifest_hash"],
        }, indent=2) + "\n"
    if filename == "stitch_route.json":
        return json.dumps({"route": manifest["qr_route"], "requires_auth": True, "requires_stitch_handshake": True}, indent=2) + "\n"
    if filename == "handshake_rules.json":
        return json.dumps({"must_verify": ["auth", "access_pass", "business_room", "memory_chip", "approved_bricks"]}, indent=2) + "\n"
    if filename == "memory_chip_pointer.json":
        return json.dumps({"memory_chip_id": manifest["memory_chip_id"], "raw_memory_on_card": False}, indent=2) + "\n"
    if filename == "approved_bricks.json":
        return json.dumps({"approved_bricks": manifest["approved_bricks"]}, indent=2) + "\n"
    if filename == "room_rules.json":
        return json.dumps({"ava_requires_live_room": True, "external_actions_require_approval": True}, indent=2) + "\n"
    if filename == "shield_rules.json":
        return json.dumps({"blocked": ["raw secrets", "token leakage", "unsafe export", "private memory dump"]}, indent=2) + "\n"
    if filename == "card_program_manifest.json":
        return json.dumps(manifest, indent=2) + "\n"
    if filename == "restore_manifest.json":
        return json.dumps({"restore_allowed": True, "requires_new_card_binding": True, "source_manifest_hash": manifest["manifest_hash"]}, indent=2) + "\n"
    if filename == "card_manifest.sha256":
        return manifest["manifest_hash"] + "\n"
    template = LAYOUT[folder][filename]
    return template.format(**manifest) if isinstance(template, str) else ""


def write_layout(target: Path, manifest: dict[str, Any], dry_run: bool) -> list[str]:
    actions: list[str] = []
    for folder, files in LAYOUT.items():
        folder_path = target / folder
        actions.append(f"MKDIR {folder_path}")
        if not dry_run:
            folder_path.mkdir(parents=True, exist_ok=True)
        for filename in files:
            file_path = folder_path / filename
            body = content_for(folder, filename, manifest)
            actions.append(f"WRITE {file_path}")
            if not dry_run:
                file_path.write_text(body, encoding="utf-8")
    ledger_event = {
        "time": utc_now(),
        "event": "SDBRAIDWRITER_WRITE" if not dry_run else "SDBRAIDWRITER_DRY_RUN",
        "public_card_id": manifest["public_card_id"],
        "business_room_id": manifest["business_room_id"],
        "manifest_hash": manifest["manifest_hash"],
    }
    ledger_line = json.dumps(ledger_event, sort_keys=True) + "\n"
    actions.append("APPEND 09_LEDGER/card_ledger.jsonl")
    actions.append("APPEND 07_CHIPFORGE/rewrite_history.jsonl")
    if not dry_run:
        (target / "09_LEDGER" / "card_ledger.jsonl").open("a", encoding="utf-8").write(ledger_line)
        (target / "07_CHIPFORGE" / "rewrite_history.jsonl").open("a", encoding="utf-8").write(ledger_line)
    return actions


def main() -> None:
    parser = argparse.ArgumentParser(description="Rewrite a mounted microSD path into an SB688 braided topology packet.")
    parser.add_argument("--target", required=True, help="Mounted microSD folder/path to write into")
    parser.add_argument("--public-card-id", required=True)
    parser.add_argument("--business-room-id", required=True)
    parser.add_argument("--memory-chip-id", required=True)
    parser.add_argument("--qr-route", required=True)
    parser.add_argument("--industry", default="custom_business")
    parser.add_argument("--approved-bricks", default="shieldbrick_001,clipperx_001,chipforge_001,avabrick_001")
    parser.add_argument("--write", action="store_true", help="Actually write files. Default is dry-run.")
    args = parser.parse_args()

    target = Path(args.target)
    verify_target(target)
    manifest = build_manifest(args)
    actions = write_layout(target, manifest, dry_run=not args.write)

    print(json.dumps({
        "brick_id": "SDBRAIDWRITER-001",
        "mode": "WRITE" if args.write else "DRY_RUN",
        "target": str(target.resolve()),
        "manifest_hash": manifest["manifest_hash"],
        "actions": actions,
        "status": "READY" if args.write else "DRY_RUN_COMPLETE",
    }, indent=2))


if __name__ == "__main__":
    main()
