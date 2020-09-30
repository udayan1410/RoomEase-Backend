var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('./models/User');

const app = express();

app.use(bodyParser.json());

app.post('/', async (req, res, next) => {
    let user = new User({ ...req.body });

    try {
        let s = await user.save();
    } catch (err) {
        console.log(err);
    };

    res.send(req.body)
})



mongoose.connect('mongodb://127.0.0.1:27017/RoomEase', { useUnifiedTopology: true, useNewUrlParser: true }, () => {
    app.listen(8080, () => {
        console.log("Server started on 8080");
    })
})




