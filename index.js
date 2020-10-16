var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var profileRoutes = require('./routes/ProfileRoutes');
var roomRoutes = require('./routes/RoomRoutes');
var taskRoutes = require('./routes/TaskRoutes');
const User = require('./models/User');


const app = express();

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
app.use('/room', roomRoutes);
app.use('/task', taskRoutes);


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


mongoose.connect('mongodb://127.0.0.1:27017/RoomEase', { useUnifiedTopology: true, useNewUrlParser: true }, () => {
    app.listen(8080, () => {
        console.log("Server started on 8080");
    })
})




