const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const { locationMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/user.js");
const { SocketAddress } = require("net");
const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);

// It sets up socketio to work with the given server.It also servs up the file that client can access
const io = socketio(server);

// Whenever a new connection is established or when a new client connects
io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Welcome !"));

    //sends message to all users except the one who has joined
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined`));
    // socket.emit  io.emit  socket.broadcast.emit
    // io.to.emit socket.brodcast.to.emit

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback(
        "The message will not be delivered as it contains abusive language"
      );
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  // if somebody disconnects,its a built-in
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left the conversation`)
      );
    }
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      locationMessage(
        user.username,
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });
});

const staticPath = path.join(__dirname, "../public");
app.use(express.static(staticPath));

server.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});
