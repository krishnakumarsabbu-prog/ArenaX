from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import asyncio
import json

router = APIRouter()


class ConnectionHub:
    def __init__(self):
        self.connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, ws: WebSocket, room: str):
        await ws.accept()
        self.connections.setdefault(room, []).append(ws)

    def disconnect(self, ws: WebSocket, room: str):
        if room in self.connections:
            self.connections[room] = [c for c in self.connections[room] if c != ws]

    async def broadcast(self, room: str, payload: dict):
        dead = []
        for ws in self.connections.get(room, []):
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, room)


hub = ConnectionHub()


@router.websocket("/ws/live/{room_id}")
async def live_updates(websocket: WebSocket, room_id: str):
    await hub.connect(websocket, room_id)
    try:
        while True:
            await asyncio.sleep(30)
            await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        hub.disconnect(websocket, room_id)
