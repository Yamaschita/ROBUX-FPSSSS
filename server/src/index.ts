import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { FPSRoom } from "./rooms/FPSRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define('fps_room', FPSRoom);

app.get("/", (req, res) => {
    res.send("FPS Server is running");
});

gameServer.listen(port);
console.log(`[GameServer] Listening on Port: ${port}`);
