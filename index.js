var express = require('express');
var bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/', (req, res, next) => {
    console.log(req.body);
    res.send(req.body)
})

app.listen(8080, () => {
    console.log("Server started on 8080");
})


