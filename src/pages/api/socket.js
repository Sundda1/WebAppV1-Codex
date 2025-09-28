import { Server } from "socket.io";

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket.io",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;
    globalThis.io = io;

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  res.end();
};

export default ioHandler;
