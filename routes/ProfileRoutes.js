const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.get('/', (req, res, next) => {
    res.send({
        "name": "Udayan"
    })
})

router.post('/:id', (req, res, next) => {

    let user = new User({ ...req.body });
    res.send(user)
})


module.exports = router;




