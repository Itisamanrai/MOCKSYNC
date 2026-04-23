const DEFAULT_TIMER_DURATION = 30 * 60;
const roomTimers = new Map();

const getRemainingTime = (endsAt) => {
    const remainingMs = endsAt - Date.now();
    return Math.max(0, Math.ceil(remainingMs / 1000));
};

const handleJoinRoom = (socket, roomId) => {
    if (!roomId || typeof roomId !== "string") {
        console.log(`[join_room][invalid] socket=${socket.id} roomId=${roomId}`);
        return;
    }

    const trimmedRoomId = roomId.trim().toUpperCase();
    if (!trimmedRoomId) {
        console.log(`[join_room][invalid-empty] socket=${socket.id}`);
        return;
    }

    socket.join(trimmedRoomId);
    socket.emit("room_joined", { room: trimmedRoomId });
    console.log(`User ${socket.id} joined room: ${trimmedRoomId}`);

    const activeTimer = roomTimers.get(trimmedRoomId);
    if (!activeTimer) {
        return;
    }

    const remainingTime = getRemainingTime(activeTimer.endsAt);
    if (remainingTime <= 0) {
        roomTimers.delete(trimmedRoomId);
        socket.emit("timer_reset", { duration: activeTimer.duration });
        return;
    }

    socket.emit("timer_started", {
        duration: activeTimer.duration,
        endsAt: activeTimer.endsAt,
        remainingTime,
    });
};

const handleSendMessage = (socket, data) => {
    if (!data || typeof data !== "object") {
        console.log(`[send_message][invalid-payload] socket=${socket.id}`);
        return;
    }

    const room = (data.room || "").trim().toUpperCase();
    const message = (data.message || "").trim();

    if (!room || !message) {
        console.log(
            `[send_message][invalid-fields] socket=${socket.id} room="${room}" messageLength=${message.length}`
        );
        return;
    }

    socket.to(room).emit("receive_message", { room, message });
    console.log(
        `[send_message][ok] from=${socket.id} room=${room} messageLength=${message.length}`
    );
};

const handleCodeChange = (socket, data) => {
    if(!data || typeof data !== "object"){
        console.log(`[code_change][invalid-payload] socket=${socket.id}`);
        return;
    }

    const room = (data.room || "").trim().toUpperCase();
    const code = typeof data.code === "string" ? data.code : "";

    if(!room){
        console.log(`[code_change][invalid-room] socket=${socket.id}`);
        return;
    }

    // send code chngs to everyone else in the same room (not sender)
    socket.to(room).emit("code_update", { code });
    console.log(
      `[code_change][ok] from=${socket.id} room=${room} codeLength=${code.length}`
    );
};

const handleTimerStart = (socket, data) => {
    if(!data || typeof data != "object"){
        console.log(`[timer_start][invalid-payload] socket=${socket.id}`);
        return;
    }

    const room = (data.room || "").trim().toUpperCase();
    const duration = Number(data.duration);

    if(!room || !Number.isFinite(duration) || duration <= 0){
        console.log(
            `[timer_start][invalid-fields] socket=${socket.id} room="${room}" duration=${data.duration}`
        );
        return;
    }

    const endsAt = Date.now() + duration * 1000;
    roomTimers.set(room, { duration, endsAt });

    socket.nsp.to(room).emit("timer_started", {
        duration,
        endsAt,
        remainingTime: duration,
    });
    console.log(
        `[timer_start][ok] from=${socket.id} room=${room} duration=${duration}`
    );
};

const handleTimerReset = (socket, data) => {
    if (!data || typeof data !== "object") {
        console.log(`[timer_reset][invalid-payload] socket=${socket.id}`);
        return;
    }

    const room = (data.room || "").trim().toUpperCase();
    const duration = Number(data.duration) || DEFAULT_TIMER_DURATION;

    if (!room) {
        console.log(`[timer_reset][invalid-room] socket=${socket.id}`);
        return;
    }

    roomTimers.delete(room);
    socket.nsp.to(room).emit("timer_reset", { duration });
    console.log(
        `[timer_reset][ok] from=${socket.id} room=${room} duration=${duration}`
    );
};

const handleDisconnect = (socket) => {
    console.log("User disconnected:", socket.id);
};

module.exports = {
    handleJoinRoom,
    handleSendMessage,
    handleCodeChange,
    handleTimerStart,
    handleTimerReset,
    handleDisconnect,
};
