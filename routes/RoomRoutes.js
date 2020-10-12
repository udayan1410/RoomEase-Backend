const express = require('express');
const router = express.Router();
const RoomModel = require('../models/RoomModel');
const User = require('../models/User');

//input : Roomname and userid
router.post('/create', async (req, res, next) => {

    let responseObject = { "Result": "Fail", "Error": "Room Exists" }

    try {

        let { userID, roomName } = req.body;

        let room = (await RoomModel.find({ roomName: roomName }))[0];

        if (!room) {
            let user = (await User.findById(userID));

            if (user && user.roomid == null) {
                let roomModel = new RoomModel({ roomName: roomName });
                roomModel['members'].push(userID);

                user.roomid = roomModel._id;

                await roomModel.save();
                await user.save();

                responseObject['Result'] = 'Success';
                responseObject['Error'] = null;
                responseObject['Roomdata'] = {
                    roomName: roomName,
                    roomid: user.roomid
                }
            }

            else {
                responseObject['Result'] = 'Fail';
                responseObject['Error'] = "User Already in a room";
            }
        }

        res.send(responseObject)
    }
    catch (err) {
        responseObject.Error = "Something went wrong";
        res.send(responseObject)
    }

});


//input = roomname and userid
router.post('/join', async (req, res, next) => {
    let { userID, roomName } = req.body;
    const responseObject = { "Result": "Fail", Error: "Room not found" }

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

            responseObject['Result'] = "Success";
            responseObject['Error'] = null;
        }
        else
            responseObject['Error'] = "User already exists in room";

    } else
        responseObject['Error'] = "User not found";

    res.send(responseObject);
});

// input  = roomname and user id
router.post('/leave', async (req, res, next) => {
    let { userID, roomName } = req.body;
    const responseObject = { "Result": "Fail", Error: "Room not found" }

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

            responseObject['Result'] = "Success";
            responseObject['Error'] = null;
        }
        else
            responseObject['Error'] = "User not in the room";
    }
    else
        responseObject['Error'] = "User not found";

    res.send(responseObject);
});

// input = request query = roomname
router.get('/members', async (req, res, next) => {

    const responseObject = { "Result": "Fail", Error: "Room not found" }

    let roomName = req.query.roomname;

    let room = (await RoomModel.find({ roomName: roomName }))[0];
    if (room) {

        let memberIds = [...room['members']];

        let users = (await User.find().where('_id').in(memberIds).select("userName email roomid"));

        responseObject['Result'] = "Success";
        responseObject['Error'] = null;
        responseObject['Members'] = [...users];
    }

    res.send(responseObject)
})

// input = request query = roomname
router.get('/tasks', async (req, res, next) => {
    const responseObject = { "Result": "Fail", Error: "Room not found" }
    let roomName = req.query.roomname;

    let room = (await RoomModel.find({ roomName: roomName }))[0];
    if (room) {
        responseObject['Result'] = "Success";
        responseObject['Error'] = null;
        responseObject['Tasks'] = [...room['tasks']];
    }

    res.send(responseObject)
})



module.exports = router;
