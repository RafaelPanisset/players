const express = require("express");
const http = require("http");
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = require("socket.io")(server);

// Middleware
app.use(express.json());

// Room storage
const rooms = {};

app.get('/', (req, res) => {
  res.send('Online');
});

io.on("connect", (socket) => {
  console.log("connected");
  console.log(socket.id, "has joined");
  
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room: ${roomId}`);
    
    // Store socket in the room
    if (!rooms[roomId]) {
      rooms[roomId] = new Set();
    }
    rooms[roomId].add(socket);
  });
  
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`Client ${socket.id} left room: ${roomId}`);
    
    // Remove socket from the room
    if (rooms[roomId]) {
      rooms[roomId].delete(socket);
      if (rooms[roomId].size === 0) {
        delete rooms[roomId];
      }
    }
  });

  socket.on('shareLocation', (data) => {
    const room_id = data.room_id;
    const location_data = data.location_data;
    console.log("Data: ", data);
    io.sockets.in(room_id).emit('getFriendPosition', location_data);
  });

});

// Clean all rooms
function cleanRooms() {
  for (const roomId in rooms) {
    if (rooms.hasOwnProperty(roomId)) {
      io.sockets.in(roomId).clients((error, clients) => {
        if (clients && clients.length > 0) {
          clients.forEach(clientId => {
            const socket = io.sockets.sockets.get(clientId);
            if (socket) {
              socket.leave(roomId);
              rooms[roomId].delete(socket);
            }
          });
        }
      });
      delete rooms[roomId];
    }
  }
}

// Clean rooms on server restart
server.on('close', () => {
  cleanRooms();
});

// Start the server
server.listen(port, "0.0.0.0", () => {
  console.log("server started");
});
