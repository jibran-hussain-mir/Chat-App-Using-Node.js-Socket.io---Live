const socket = io();

// Elements
const messageForm = document.getElementById("message-form");
const sendMessageButton = messageForm.querySelector("button");
const inputField = messageForm.querySelector("input");
const sendLocationButton = document.getElementById("send-location");
const messages = document.getElementById("messages");

// Templetes
const messageTemeplete = document.getElementById("message-templete").innerHTML;
const locationTempelete =
  document.getElementById("location-templete").innerHTML;
const sidebarTemplete = document.getElementById("sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // Height of messages container
  const containerHeight = messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemeplete, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Disable the send button till the message is not delivered to the other user
  sendMessageButton.setAttribute("disabled", "disabled");
  const message = inputField.value;

  socket.emit("sendMessage", message, (error) => {
    // third callback function is for acknowledgement

    sendMessageButton.removeAttribute("disabled");
    inputField.value = " ";
    inputField.focus();

    if (error) alert(error);
    else console.log("Message Delivered");
  });
});

sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) return;

  // Disable the Send Location button till the acknowledgement is recieved
  sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("sendLocation", location, () => {
      sendLocationButton.removeAttribute("disabled");
      console.log("Location shared");
    });
  });
});

socket.on("locationMessage", (url) => {
  const html = Mustache.render(locationTempelete, {
    username: url.username,
    createdAt: moment(url.url.createdAt).format("h:mm a"),
    locationURL: url.url,
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplete, {
    room,
    users,
  });
  document.getElementById("sidebar").innerHTML = html;
});
