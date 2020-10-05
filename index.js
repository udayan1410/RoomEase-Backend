var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var profileRoutes = require('./routes/ProfileRoutes');
var roomRoutes = require('./routes/RoomRoutes');

const User = require('./models/User');


const app = express();

app.use(bodyParser.json());

app.use('/profile', profileRoutes);
app.use('/room', roomRoutes);

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

app.post('/login', async(req, res)=>{
    try {
        let previousUsers = await User.find({email: req.body.email, password: req.body.password });
        let responseObj = { "Result" : "Fail", "Error": "User not authorized" };
        let obj;
        if (previousUsers.length == 1 ) {
            responseObj.Result = "Success";
            responseObj.Error = null;

            let {email,userName,_id,roomid,phoneNumber} = previousUsers[0];
            obj = {
                email : email,
                userName : userName,
                _id : _id,
                roomid : roomid,
                phoneNumber : phoneNumber
            }
        }
        res.send({
            responseObj,
            user:{...obj}
        });
    }
    catch(error) {
        console.log(error);
        res.send("Error: ",error)
    }
})


mongoose.connect('mongodb://127.0.0.1:27017/RoomEase', { useUnifiedTopology: true, useNewUrlParser: true }, () => {
    app.listen(8080, () => {
        console.log("Server started on 8080");
    })
})




