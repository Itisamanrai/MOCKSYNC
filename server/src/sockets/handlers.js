const {
  handleJoinRoom,
  handleSendMessage,
  handleCodeChange,
  handleTimerStart,
  handleTimerReset,
  handleDisconnect,
} = require("../controllers/socketController");

const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", (roomId) => {
      try {
        handleJoinRoom(socket, roomId);
      } catch (error) {
        console.error(
          `[join_room][error] socket=${socket.id} msg=${error.message}`,
        );
      }
    });

    socket.on("send_message", (data) => {
      try {
        handleSendMessage(socket, data);
      } catch (error) {
        console.error(
          `[send_message][error] socket=${socket.id} msg=${error.message}`,
        );
      }
    });

    socket.on("code_change", (data) => {
      try {
        handleCodeChange(socket, data);
      } catch (error) {
        console.error(
          `[code_change][error] socket=${socket.id} msg=${error.message}`,
        );
      }
    });

    socket.on("timer_start", (data) => {
      try {
        handleTimerStart(socket, data);
      } catch (error) {
        console.error(
          `[timer_start][error] socket=${socket.id} msg=${error.message}`,
        );
      }
    });

    socket.on("timer_reset", (data) => {
      try {
        handleTimerReset(socket, data);
      } catch (error) {
        console.error(
          `[timer_reset][error] socket=${socket.id} msg=${error.message}`,
        );
      }
    });

    socket.on("disconnect", () => {
      try {
        handleDisconnect(socket);
      } catch (error) {
        console.error(
          `[disconnect][error] socket=${socket.id} msg=${error.message}`,
        );
      }
    });
  });
};

module.exports = { registerSocketHandlers };
