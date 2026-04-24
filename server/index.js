const { registerSocketHandlers } = require("./src/sockets/handlers");
const router = require("./src/routes/index");
const express = require("express"); // express handles API
const http = require("http");  // it is needed for socket.io
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const { connectDB } = require("./src/config/db");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" })); // Limit JSON payload to 1MB
app.use(express.urlencoded({ extended: true, limit: "1mb" })); // Limit URL-encoded payload
app.use(router); // using of routes from index.js from routes

// Error handling middleware for malformed JSON and other errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ message: "Malformed JSON request" });
    }
    if (err.message && err.message.includes("request entity too large")) {
        return res.status(413).json({ message: "Request payload too large (max 1MB)" });
    }
    console.error("[error]", err.message);
    return res.status(500).json({ message: "Internal server error" });
});

const server = http.createServer(app); // connection implemantion of socket io

const io = new Server(server, {    // join of room in socket io is implement 
    cors: {
        origin: "*",
    },
});

registerSocketHandlers(io);

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("[startup] Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
