from __future__ import annotations

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from spine.orchestrator import STITCH

app = FastAPI(title="SB689 STITCH Hive Mind", version="0.1.0")
stitch = STITCH()
boot_state = stitch.boot()


class ProcessRequest(BaseModel):
    user_input: str = Field(..., min_length=1, max_length=8000)


@app.get("/")
def root() -> dict[str, object]:
    return {
        "system": "SB689 STITCH Hive Mind",
        "status": "ONLINE",
        "boot": boot_state,
        "routes": ["GET /", "GET /nodes", "GET /memory", "POST /process", "WS /ws"],
    }


@app.get("/nodes")
def nodes() -> dict[str, object]:
    return {"nodes": stitch.registry.list_nodes()}


@app.get("/memory")
def memory() -> dict[str, object]:
    return {"memory": stitch.memory.read_all()}


@app.post("/process")
def process(req: ProcessRequest) -> dict[str, object]:
    return stitch.process(req.user_input)


@app.websocket("/ws")
async def websocket_hub(ws: WebSocket) -> None:
    await ws.accept()
    await ws.send_json({"system": "SB689 STITCH Hive Mind", "status": "CONNECTED"})
    try:
        while True:
            message = await ws.receive_text()
            result = stitch.process(message)
            await ws.send_json(result)
    except WebSocketDisconnect:
        return
