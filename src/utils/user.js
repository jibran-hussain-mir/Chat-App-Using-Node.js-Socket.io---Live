const users = [];

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // If Username or room are not provided
  if (!username || !room) {
    return {
      error: "Username and Password are required",
    };
  }

  // Existing User
  const isExisting = users.find((user) => {
    return user.username === username && user.room === room;
  });

  // Validation
  if (isExisting) {
    return {
      error: "User with this name already exists in the room",
    };
  }

  //   Store the user
  const user = {
    id,
    username,
    room,
  };
  users.push(user);
  return { user };
};

// Removing the Users

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Get User
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

// Get Users in a Room
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === user.room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
