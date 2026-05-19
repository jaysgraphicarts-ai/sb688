# SB688 Local Setup — Windows PowerShell

This guide starts the SB688 public room locally on a Windows laptop using Git, VS Code, and Docker.

---

## Requirements

Install these first:

```powershell
winget install --id Git.Git -e
winget install --id Docker.DockerDesktop -e
winget install --id Microsoft.VisualStudioCode -e
```

Restart PowerShell after installing.

---

## Clone the repo

```powershell
cd $HOME
mkdir JGA
cd JGA
git clone https://github.com/jaysgraphicarts-ai/sb688.git
cd sb688
code .
```

---

## Create local env file

```powershell
copy .env.example .env
notepad .env
```

Never commit `.env`.

---

## Start Docker room

Open Docker Desktop first, then run:

```powershell
docker compose up -d
```

Open local site:

```powershell
start http://localhost:8088
```

Check status:

```powershell
docker ps
git status
```

Stop local room:

```powershell
docker compose down
```

---

## What works locally

The Docker setup serves the public SB688 page and docs locally.

It does not run private Memory Chips on your laptop unless private backend credentials and runtime code are added outside the public repo.

---

## Backend status

The Supabase backend project is named `SB - 688`.

The backend has:

- business rooms
- business members
- access passes
- Memory Chips
- Clip Bricks
- attached business Clip Bricks
- STITCH sessions
- ledger events
- public intake requests
- activation log
- STITCH handshake Edge Function

Live private operation requires authentication, active access pass, active Memory Chip, approved Clip Bricks, and a passing STITCH handshake.
