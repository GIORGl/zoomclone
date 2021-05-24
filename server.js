const express = require("express");
const app = express();
const server = require("http").createServer(app);
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
  port: 3000,
});

const PORT = process.env.PORT || 3000;
app.use("/peerjs", peerServer);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomid: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomid, userid) => {
    socket.join(roomid);
    socket.to(roomid).emit("user-connected", userid);

    socket.on("message", (message) => {
      io.to(roomid).emit("createMessage", message);
    });
  });
});

server.listen(PORT, () => {
  console.log("server running on port " + PORT);
});
