const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { SocketAddress } = require("net");
const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketio(server); // It sets up socketio to work with the given server.It also servs up the file that client can access

// Whenever a new connection is established or when a new client connects
io.on("connection", (socket) => {
  console.log("New Web Socket connection");
  socket.emit("message", "Welcome !");
  socket.broadcast.emit("message", "A new user has entered the room"); //sends message to all users except the one who has joined
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback(
        "The message will not be delivered as it contains abusive language"
      );
    }
    io.emit("message", message);
    callback();
  });

  // if somebody disconnects,its a built in
  socket.on("disconnect", () => {
    io.emit("message", "A user has left the conversation");
  });

  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "message",
      `My location is : https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    );
    callback();
  });
});

const staticPath = path.join(__dirname, "../public");
app.use(express.static(staticPath));

server.listen(port, () => {
  console.log(`Server is listening on Port ${port}`);
});
