import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoutes.js";
import doctorRouter from "./routes/doctorRoutes.js";
import userRouter from "./routes/userRoutes.js";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const rooms = {};

connectDB();
connectCloudinary();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

io.on("connection", (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  socket.on("room:join", ({ email, room }) => {
    if (!email || !room) {
      console.log("Invalid join attempt", { email, room });
      return;
    }
    socket.join(room);
    console.log(`${email} joined room ${room}`);
    io.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("room:join", { email, room });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("ice:candidate", ({ to, candidate }) => {
    io.to(to).emit("ice:candidate", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Notify all rooms this socket was part of
    for (const room of Object.keys(rooms)) {
      if (rooms[room].has(socket.id)) {
        rooms[room].delete(socket.id);

        // Notify remaining participants that call ended
        io.to(room).emit("call:ended");

        // Close the room if empty
        if (rooms[room].size === 0) delete rooms[room];
      }
    }
  });

  // Optional: manual End Call from client
  socket.on("call:ended", ({ room }) => {
    if (!room) return;
    io.to(room).emit("call:ended");
    if (rooms[room]) delete rooms[room];
  });


  // Message System
  socket.on("send:message", ({ room, sender, text }) => {
    if (!room || !text) return;
    const message = { id: Date.now(), text, sender };
    io.to(room).emit("receive:message", message);
  });

  // Mic status relay
  socket.on("mic:status", ({ to, enabled }) => {
    if (!to) return;
    io.to(to).emit("mic:status", { enabled, from: socket.id }); // add from
  });
});

app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => res.send("Hello World!"));

server.listen(PORT, () => {
  console.log(`HTTP + Socket.IO server running on port ${PORT}`);
});
