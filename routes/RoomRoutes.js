const express = require('express');
const router = express.Router();
const RoomModel = require('../models/RoomModel');
const User = require('../models/User');


router.post('/create', async (req, res, next) => {
    let responseObj = { "Result": "Fail", "Error": "Room Exists" }
    let roomExists = (await RoomModel.find({ roomName: req.body.roomName })).length != 0;

    if (!roomExists) {
        let roomModel = new RoomModel({ ...req.body });
        await roomModel.save();
        responseObj['Result'] = 'Success';
        responseObj['Error'] = null;
    }

    res.send(responseObj)
});


router.post('/join', async (req, res, next) => {
    let { userID, roomName } = req.body;
    const responseObj = { "Result": "Fail", Error: "Room not found" }

    let user = await User.findById(userID);

    if (user) {
        let room = (await RoomModel.find({ roomName: roomName }))[0];

        if (room && !room['members'].includes(userID)) {
            let { members, _id } = room;
            members.push(userID);
            room['members'] = members;

            user.roomid = _id;

            await room.save();
            await user.save();

            responseObj['Result'] = "Success";
            responseObj['Error'] = null;
        }
        else
            responseObj['Error'] = "User already exists in room";

    } else
        responseObj['Error'] = "User not found";

    res.send(responseObj);
});



module.exports = router;
