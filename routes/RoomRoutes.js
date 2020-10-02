const express = require('express');
const router = express.Router();
const RoomModel = require('../models/RoomModel');
const User = require('../models/User');


router.post('/create', async (req, res, next) => {
    let responseObj = { "Result": "Fail", "Error": "Room Exists" }

    let { userID, roomName } = req.body;

    let room = (await RoomModel.find({ roomName: roomName }))[0];

    if (!room) {
        let user = (await User.findById(userID));

        if (user) {
            let roomModel = new RoomModel({ roomName: roomName });
            roomModel['members'].push(userID);

            user.roomid = roomModel._id;

            await roomModel.save();
            await user.save();

            responseObj['Result'] = 'Success';
            responseObj['Error'] = null;
            responseObj['Roomdata'] = {
                roomName: roomName,
                roomid: user.roomid
            }
        }

        else {
            responseObj['Result'] = 'Fail';
            responseObj['Error'] = "User not found";
        }
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


router.post('/leave', async (req, res, next) => {
    let { userID, roomName } = req.body;
    const responseObj = { "Result": "Fail", Error: "Room not found" }

    let user = await User.findById(userID);
    if (user) {
        let room = (await RoomModel.find({ roomName: roomName }))[0];

        if (room && room['members'].includes(userID)) {
            let { members, _id } = room;

            members.splice(members.indexOf(userID), 1);
            room['members'] = members;

            user.roomid = null;

            await room.save();
            await user.save();

            responseObj['Result'] = "Success";
            responseObj['Error'] = null;
        }
        else
            responseObj['Error'] = "User not in the room";
    }
    else
        responseObj['Error'] = "User not found";

    res.send(responseObj);
});


router.get('/members', async (req, res, next) => {
    const responseObj = { "Result": "Fail", Error: "Room not found" }
    let roomName = req.query.roomname;

    let room = (await RoomModel.find({ roomName: roomName }))[0];
    if (room) {

        let memberIds = [...room['members']];

        let users = (await User.find().where('_id').in(memberIds).select("userName email roomid"));

        responseObj['Result'] = "Success";
        responseObj['Error'] = null;
        responseObj['Members'] = [users];
    }

    res.send(responseObj)
})

router.get('/tasks', async (req, res, next) => {
    const responseObj = { "Result": "Fail", Error: "Room not found" }
    let roomName = req.query.roomname;

    let room = (await RoomModel.find({ roomName: roomName }))[0];
    if (room) {
        responseObj['Result'] = "Success";
        responseObj['Error'] = null;
        responseObj['Tasks'] = [...room['tasks']];
    }

    res.send(responseObj)
})



module.exports = router;
