const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const io = new Server();
const app = express();

app.use(bodyParser.json());

const emailToSocketMapping = new Map();

io.on("connetion", (socket) => {
  console.log("New socket connected:", socket.id);
  socket.on('join-room', data => {
    const { roomId, userId } = data;
    console.log("User", userId, "joined room:", roomId);
    emailToSocketMapping.set(userId, socket.id);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);
  })
});

app.listen(8000, () => console.log('Listening on port 8000'));
io.listen(8001);