var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var profileRoutes = require('./routes/ProfileRoutes');

const app = express();

app.use(bodyParser.json());

app.use('/profile', profileRoutes);


mongoose.connect('mongodb://127.0.0.1:27017/RoomEase', { useUnifiedTopology: true, useNewUrlParser: true }, () => {
    app.listen(8080, () => {
        console.log("Server started on 8080");
    })
})




