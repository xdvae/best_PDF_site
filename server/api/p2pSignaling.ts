import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface Room {
  sender: WebSocket | null;
  receiver: WebSocket | null;
}

const rooms = new Map<string, Room>();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function setupP2PSignaling(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/p2p" });

  wss.on("connection", (ws: WebSocket) => {
    let myCode: string | null = null;
    let myRole: "sender" | "receiver" | null = null;

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        if (msg.type === "create-room") {
          // Sender creates a room and gets a code
          let code = generateCode();
          while (rooms.has(code)) code = generateCode(); // ensure unique
          rooms.set(code, { sender: ws, receiver: null });
          myCode = code;
          myRole = "sender";
          ws.send(JSON.stringify({ type: "room-created", code }));
        }

        else if (msg.type === "join-room") {
          // Receiver joins with a code
          const code = (msg.code as string).toUpperCase().trim();
          const room = rooms.get(code);
          if (!room) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid or expired code. Check the code and try again." }));
            return;
          }
          if (room.receiver) {
            ws.send(JSON.stringify({ type: "error", message: "Someone is already receiving this transfer." }));
            return;
          }
          room.receiver = ws;
          myCode = code;
          myRole = "receiver";
          // Tell receiver they're connected
          ws.send(JSON.stringify({ type: "room-joined", code }));
          // Tell sender a receiver connected
          room.sender?.send(JSON.stringify({ type: "receiver-connected" }));
        }

        else if (msg.type === "signal") {
          // Relay WebRTC signaling (offer/answer/ICE) between peers
          const room = myCode ? rooms.get(myCode) : null;
          if (!room) return;
          const target = myRole === "sender" ? room.receiver : room.sender;
          target?.send(JSON.stringify({ type: "signal", data: msg.data }));
        }

        else if (msg.type === "transfer-meta") {
          // Sender broadcasts file metadata list before streaming
          const room = myCode ? rooms.get(myCode) : null;
          if (!room) return;
          room.receiver?.send(JSON.stringify({ type: "transfer-meta", files: msg.files }));
        }

        else if (msg.type === "chunk") {
          // Relay file chunks from sender to receiver
          const room = myCode ? rooms.get(myCode) : null;
          if (!room) return;
          room.receiver?.send(JSON.stringify({ type: "chunk", name: msg.name, data: msg.data, index: msg.index, total: msg.total }));
        }

        else if (msg.type === "transfer-done") {
          const room = myCode ? rooms.get(myCode) : null;
          if (!room) return;
          room.receiver?.send(JSON.stringify({ type: "transfer-done" }));
          // Clean up room after small delay
          setTimeout(() => { if (myCode) rooms.delete(myCode); }, 5000);
        }

        else if (msg.type === "cancel") {
          const room = myCode ? rooms.get(myCode) : null;
          if (!room) return;
          const other = myRole === "sender" ? room.receiver : room.sender;
          other?.send(JSON.stringify({ type: "cancelled" }));
          if (myCode) rooms.delete(myCode);
        }

      } catch (e) {
        console.error("P2P WS error:", e);
      }
    });

    ws.on("close", () => {
      if (!myCode) return;
      const room = rooms.get(myCode);
      if (!room) return;
      // Notify the other peer
      const other = myRole === "sender" ? room.receiver : room.sender;
      other?.send(JSON.stringify({ type: "peer-disconnected" }));
      rooms.delete(myCode);
    });
  });

  console.log("P2P signaling server ready at /ws/p2p");
}
