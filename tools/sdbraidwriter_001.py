#!/usr/bin/env python3
"""
SDBRAIDWRITER-001 — SB688 USB / SD / microSD Braided Topology Formatter

Restructures a mounted USB, SD, mini-chip storage path, or microSD card into an
SB688 triple-braided file-system packet.

Truth boundary: this does not alter silicon, NAND, controller firmware, or real
hardware topology. It creates a verified storage layout with manifests, truth
nodes, hashes, restore support, and ledger records.

Default is dry-run. Add --write to write files. Add --clean only when you want
to clear the target folder before writing.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

FORBIDDEN_NAMES = {".git", "windows", "program files", "program files (x86)", "users", "system32"}
DEFAULT_APPROVED_BRICKS = "shieldbrick_001,clipperx_001,chipforge_001,sdbraidwriter_001,avabrick_001"

LAYOUT: dict[str, dict[str, str | None]] = {
    "00_READ_FIRST": {
        "README.txt": "SB688 braided topology storage packet. This device is a physical access/storage packet, not the secure backend.\n",
        "OWNER_INSTRUCTIONS.txt": "Scan the QR/login route, authenticate, then let STITCH verify backend Memory Chip binding.\n",
    },
    "01_REACTIVE_BRAID/access_key": {
        "public_card_id.txt": "{public_card_id}\n",
        "qr_route.txt": "{qr_route}\n",
        "access_manifest.json": None,
    },
    "01_REACTIVE_BRAID/launch": {
        "start_here.txt": "Start here: authenticate through the QR route, then let STITCH verify room and Memory Chip pointer.\n",
        "emergency_rules.txt": "If the device is lost, revoke the card ID in backend and issue a replacement binding.\n",
    },
    "02_DELIBERATIVE_BRAID/stitch_handshake": {"stitch_route.json": None, "handshake_rules.json": None},
    "02_DELIBERATIVE_BRAID/clip_bricks": {"approved_bricks.json": None},
    "02_DELIBERATIVE_BRAID/business_packet": {
        "business_packet_manifest.json": None,
        "put_business_docs_here.txt": "Place approved business docs here. Do not place raw secrets here.\n",
    },
    "03_REFLECTIVE_BRAID/memory_link": {
        "memory_chip_pointer.json": None,
        "no_raw_secrets.txt": "No raw passwords, service role keys, tokens, or private Memory Chip contents belong on this device.\n",
    },
    "03_REFLECTIVE_BRAID/truth_nodes": {"truth_node_manifest.json": None, "file_hash_index.json": "{}\n"},
    "03_REFLECTIVE_BRAID/verification": {"verification_rules.json": None, "verification_report.json": None},
    "03_REFLECTIVE_BRAID/ledger": {"card_ledger.jsonl": "", "card_manifest.sha256": ""},
    "03_REFLECTIVE_BRAID/restore": {
        "restore_manifest.json": None,
        "recovery_instructions.txt": "Replacement devices must receive a new binding and ledger event. Compare truth-node hashes to detect corruption.\n",
    },
    "04_SHIELD": {"shield_rules.json": None, "blocked_items.txt": "Blocked: raw secrets, private memory, payment secrets, unencrypted client DB, private ledgers, active tokens.\n"},
    "05_CHIPFORGE": {"card_program_manifest.json": None, "rewrite_history.jsonl": ""},
    "06_AVA_ROOM": {"ava_start_here.txt": "AVA opens only after CLIPPERX + STITCH verify the business room and storage packet state.\n", "room_rules.json": None},
    "07_EXPORTS": {"encrypted_exports_only.txt": "Only encrypted exports belong here.\n"},
    "08_MEDIA_KIT": {"put_brand_files_here.txt": "Put approved brand/media files here. Do not place secrets here.\n"},
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def dump(data: dict[str, Any]) -> str:
    return json.dumps(data, indent=2, sort_keys=True) + "\n"


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_target(target: Path) -> None:
    resolved = target.resolve()
    parts = {part.lower() for part in resolved.parts}
    if any(name in parts for name in FORBIDDEN_NAMES):
        raise SystemExit(f"BLOCKED: unsafe target path: {resolved}")
    if resolved == Path(resolved.anchor):
        raise SystemExit("BLOCKED: refusing to write directly to drive root. Create a folder like E:\\SB688_CARD first.")
    if not target.exists() or not target.is_dir():
        raise SystemExit(f"BLOCKED: target must be an existing folder: {target}")


def build_manifest(args: argparse.Namespace) -> dict[str, Any]:
    approved = [b.strip() for b in args.approved_bricks.split(",") if b.strip()]
    manifest = {
        "brick_id": "SDBRAIDWRITER-001",
        "system": "SB688 / SB689",
        "created_at": utc_now(),
        "storage_kind": args.storage_kind,
        "declared_size_gb": args.size_gb,
        "public_card_id": args.public_card_id,
        "business_room_id": args.business_room_id,
        "memory_chip_id": args.memory_chip_id,
        "qr_route": args.qr_route,
        "industry": args.industry,
        "approved_bricks": approved,
        "secrets_policy": "no raw secrets on device",
        "topology": "triple_braided_file_system_packet",
        "braids": ["reactive", "deliberative", "reflective"],
        "self_healing_model": "truth-node hashes + restore manifest + ledgered rewrite history",
    }
    manifest["manifest_hash"] = sha256_text(json.dumps(manifest, sort_keys=True))
    return manifest


def content_for(folder: str, filename: str, manifest: dict[str, Any]) -> str:
    if filename == "access_manifest.json":
        return dump({"public_card_id": manifest["public_card_id"], "business_room_id": manifest["business_room_id"], "storage_kind": manifest["storage_kind"], "declared_size_gb": manifest["declared_size_gb"], "qr_route": manifest["qr_route"], "manifest_hash": manifest["manifest_hash"]})
    if filename == "stitch_route.json":
        return dump({"route": manifest["qr_route"], "requires_auth": True, "requires_stitch_handshake": True})
    if filename == "handshake_rules.json":
        return dump({"must_verify": ["auth", "access_pass", "business_room", "memory_chip", "approved_bricks", "card_manifest_hash"]})
    if filename == "approved_bricks.json":
        return dump({"approved_bricks": manifest["approved_bricks"]})
    if filename == "business_packet_manifest.json":
        return dump({"industry": manifest["industry"], "packet_type": "business_packet", "raw_secrets_allowed": False})
    if filename == "memory_chip_pointer.json":
        return dump({"memory_chip_id": manifest["memory_chip_id"], "raw_memory_on_device": False, "stitched_into_braid": True})
    if filename == "truth_node_manifest.json":
        return dump({"truth_nodes": ["file_hash_index", "card_manifest_hash", "ledger_chain"], "verification_method": "sha256"})
    if filename == "verification_rules.json":
        return dump({"verify": ["file_hash_index", "card_manifest", "ledger_events", "no_raw_secrets_policy"], "blocked_on_mismatch": True})
    if filename == "verification_report.json":
        return dump({"created_at": utc_now(), "status": "PENDING_HASH_INDEX", "notes": "Run verification after write."})
    if filename == "restore_manifest.json":
        return dump({"restore_allowed": True, "requires_new_card_binding": True, "source_manifest_hash": manifest["manifest_hash"]})
    if filename == "shield_rules.json":
        return dump({"blocked": ["raw secrets", "token leakage", "unsafe export", "private memory dump", "payment secrets"]})
    if filename == "card_program_manifest.json":
        return dump(manifest)
    if filename == "room_rules.json":
        return dump({"ava_requires_live_room": True, "external_actions_require_approval": True})
    if filename == "card_manifest.sha256":
        return manifest["manifest_hash"] + "\n"
    template = LAYOUT[folder][filename]
    return template.format(**manifest) if isinstance(template, str) else ""


def clean_target(target: Path, dry_run: bool) -> list[str]:
    actions: list[str] = []
    for child in target.iterdir():
        actions.append(f"REMOVE {child}")
        if not dry_run:
            shutil.rmtree(child) if child.is_dir() else child.unlink()
    return actions


def build_hash_index(target: Path) -> dict[str, str]:
    index: dict[str, str] = {}
    for path in sorted(target.rglob("*")):
        if path.is_file():
            rel = path.relative_to(target).as_posix()
            if rel.endswith("file_hash_index.json"):
                continue
            index[rel] = sha256_file(path)
    return index


def write_layout(target: Path, manifest: dict[str, Any], dry_run: bool, clean: bool) -> list[str]:
    actions: list[str] = []
    if clean:
        actions.extend(clean_target(target, dry_run))
    for folder, files in LAYOUT.items():
        folder_path = target / folder
        actions.append(f"MKDIR {folder_path}")
        if not dry_run:
            folder_path.mkdir(parents=True, exist_ok=True)
        for filename in files:
            file_path = folder_path / filename
            actions.append(f"WRITE {file_path}")
            if not dry_run:
                file_path.write_text(content_for(folder, filename, manifest), encoding="utf-8")
    event = {"time": utc_now(), "event": "SDBRAIDWRITER_WRITE" if not dry_run else "SDBRAIDWRITER_DRY_RUN", "public_card_id": manifest["public_card_id"], "business_room_id": manifest["business_room_id"], "manifest_hash": manifest["manifest_hash"]}
    actions.append("APPEND 03_REFLECTIVE_BRAID/ledger/card_ledger.jsonl")
    actions.append("APPEND 05_CHIPFORGE/rewrite_history.jsonl")
    if not dry_run:
        line = json.dumps(event, sort_keys=True) + "\n"
        (target / "03_REFLECTIVE_BRAID/ledger/card_ledger.jsonl").open("a", encoding="utf-8").write(line)
        (target / "05_CHIPFORGE/rewrite_history.jsonl").open("a", encoding="utf-8").write(line)
        hash_index = build_hash_index(target)
        (target / "03_REFLECTIVE_BRAID/truth_nodes/file_hash_index.json").write_text(dump(hash_index), encoding="utf-8")
        verification = {"created_at": utc_now(), "status": "TRUTH_NODES_BUILT", "indexed_files": len(hash_index), "index_hash": sha256_text(json.dumps(hash_index, sort_keys=True))}
        (target / "03_REFLECTIVE_BRAID/verification/verification_report.json").write_text(dump(verification), encoding="utf-8")
        actions.append("WRITE truth-node hash index")
        actions.append("WRITE verification report")
    return actions


def main() -> None:
    parser = argparse.ArgumentParser(description="Format/rewrite mounted USB, SD, or microSD storage into SB688 triple-braided topology.")
    parser.add_argument("--target", required=True, help="Existing folder on mounted USB/SD/microSD, e.g. E:\\SB688_CARD")
    parser.add_argument("--public-card-id", required=True)
    parser.add_argument("--business-room-id", required=True)
    parser.add_argument("--memory-chip-id", required=True)
    parser.add_argument("--qr-route", required=True)
    parser.add_argument("--industry", default="custom_business")
    parser.add_argument("--storage-kind", default="microSD", choices=["USB", "SD", "microSD", "mini-chip", "folder"])
    parser.add_argument("--size-gb", type=int, default=32)
    parser.add_argument("--approved-bricks", default=DEFAULT_APPROVED_BRICKS)
    parser.add_argument("--clean", action="store_true", help="Remove existing files/folders inside target before writing.")
    parser.add_argument("--write", action="store_true", help="Actually write files. Default is dry-run.")
    args = parser.parse_args()

    target = Path(args.target)
    verify_target(target)
    manifest = build_manifest(args)
    actions = write_layout(target, manifest, dry_run=not args.write, clean=args.clean)
    print(dump({"brick_id": "SDBRAIDWRITER-001", "mode": "WRITE" if args.write else "DRY_RUN", "target": str(target.resolve()), "storage_kind": args.storage_kind, "declared_size_gb": args.size_gb, "manifest_hash": manifest["manifest_hash"], "actions": actions, "status": "READY" if args.write else "DRY_RUN_COMPLETE"}))


if __name__ == "__main__":
    main()
