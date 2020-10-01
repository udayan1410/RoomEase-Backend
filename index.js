var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var profileRoutes = require('./routes/ProfileRoutes');

const User = require('./models/User');


const app = express();

app.use(bodyParser.json());

app.use('/profile', profileRoutes);

app.post('/signup', async (req, res) => {
    try {
        let previousUsers = await User.find({ email: req.body.email });
        let responseObj = { "Result ": "Not Done" }

        if (previousUsers.length == 0) {
            let user = new User({ ...req.body });
            await user.save();
            responseObj['Result '] = "Done";
        }

        res.send(responseObj);

    } catch (err) {
        console.log("Error [POST /signup] ", err);
    }
})


mongoose.connect('mongodb://127.0.0.1:27017/RoomEase', { useUnifiedTopology: true, useNewUrlParser: true }, () => {
    app.listen(8080, () => {
        console.log("Server started on 8080");
    })
})




