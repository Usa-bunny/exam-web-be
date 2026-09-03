const { Server } = require("socket.io");

let io: any;

const init = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: any) => {
    console.log("Client connected:", socket.id);

    socket.on("join-monitor", () => {
      socket.join("monitor");
      console.log(`Client ${socket.id} joined monitor room`);
    });

    socket.on("leave-monitor", () => {
      socket.leave("monitor");
      console.log(`Client ${socket.id} left monitor room`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io has not been initialized");

  return io;
};

module.exports = {
  init,
  getIO,
};
