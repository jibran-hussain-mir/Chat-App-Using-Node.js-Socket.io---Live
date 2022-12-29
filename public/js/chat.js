const socket = io();

socket.on("message", (message) => {
  console.log(message);
});

document.getElementById("message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("message").value;

  socket.emit("sendMessage", message, (error) => {
    // third callback function is for acknowledgement
    if (error) alert(error);
    else console.log("Message Delivered");
  });
});

document.getElementById("send-location").addEventListener("click", () => {
  if (!navigator.geolocation) return;
  else {
    navigator.geolocation.getCurrentPosition((position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      socket.emit("sendLocation", location, () => {
        console.log("Location shared");
      });
    });
  }
});
