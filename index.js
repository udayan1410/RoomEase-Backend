var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var profileRoutes = require('./routes/ProfileRoutes');
var roomRoutes = require('./routes/RoomRoutes');
var taskRoutes = require('./routes/TaskRoutes');

var notesRoutes = require('./routes/NotesRoutes');

var splitEaseRoutes = require('./routes/SplitEaseRoutes');

const User = require('./models/User');
const RoomModel = require('./models/RoomModel');
const NotesModel = require('./models/NotesModel');

const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/profile', profileRoutes);
app.use('/notes', notesRoutes);
app.use('/room', roomRoutes);
app.use('/task', taskRoutes);
app.use('/splitease', splitEaseRoutes);



app.post('/signup', async (req, res) => {
    try {
        let previousMail = await User.find({ email: req.body.email });
        let previousUserName = await User.find({ userName: req.body.userName });
        let responseObj = { "Result": "Fail", "Error": "User Exists" }

        if (previousUserName.length == 0 && previousMail.length == 0) {
            let user = new User({ ...req.body, roomid: null });
            await user.save();
            responseObj['Result'] = "Success";
            responseObj['Error'] = null;
        }

        res.send(responseObj);

    } catch (err) {
        console.log("Error [POST /signup] ", err.message);
        res.send({ "Result": err.message })
    }
})

app.post('/login', async (req, res) => {
    try {
        let previousUsers = await User.find({ email: req.body.email, password: req.body.password }).select("userName _id").populate("roomid");
        let responseObject = { "Result": "Fail", "Error": "User not authorized" };
        let obj;
        // console.log(previousUsers);
        if (previousUsers.length == 1) {
            responseObject.Result = "Success";
            responseObject.Error = null;

            let { userName, _id, roomid } = previousUsers[0];
            obj = {
                userName: userName,
                _id: _id,
                roomid: roomid ? roomid._id : null,
                roomName: roomid ? roomid.roomName : null
            }
        }
        res.send({
            responseObject,
            user: { ...obj }
        });
    }
    catch (error) {
        console.log(error);
        res.send("Error: ", error)
    }
})


var chatData = {};

io.on('connection', async (socket) => {

    let roomName = socket.handshake.query.room;
    let userID = socket.handshake.query.userid;
    let userName = (await User.findById(userID)).userName;

    chatData[userID] = {
        room: roomName,
        socketID: socket.id,
        userName: userName
    }

    socket.join(roomName);

    socket.on('message', async (data) => {
        let { message, room, id } = data;

        let messageData = {};
        messageData['sender'] = chatData[userID].userName;
        messageData['text'] = message;
        messageData['messageTime'] = new Date().getHours() + ":" + new Date().getMinutes();
        messageData['messageID'] = Date.now().toString(36) + Math.random().toString(36).substr(0);

        let rooms = (await RoomModel.find({ roomName: room }))[0];
        let chat = rooms.chat;
        chat.push(messageData);
        rooms.chat = chat;
        rooms.save();

        io.to(room).emit('chatMessage', messageData)
    })

    socket.on('typing', async (data) => {
        let sender = chatData[userID].userName;
        data.message = `${sender} in typing...`
        io.to(data.room).emit('promptMessage', data);
    })

    socket.on('stop_typing', async (data) => {
        data.message = "";
        io.to(data.room).emit('promptMessage', data)
    })

    socket.on('disconnect', () => {
        // console.log("Disconnected ", socket.id);
        // io.to(roomName).emit('roomMessage', `${chatData[userID].userName} Left THE ROOM`)
        delete chatData[socket.id];
    })


})


mongoose.connect('mongodb://127.0.0.1:27017/RoomEase', { useUnifiedTopology: true, useNewUrlParser: true }, () => {
    http.listen(8080, () => {
        console.log("Server started on 8080");
    })
})




