const express = require('express');
const router = express.Router();
const RoomModel = require('../models/RoomModel');
const FeedModel = require('../models/FeedModel');
const User = require('../models/User');
const Constants = require("../contants");

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

                let feedModel = new FeedModel({ roomID: roomModel._id, feed: [{ createdOn: Constants.getTodaysDate(), message: `Room Created ${roomName}` }] })
                feedModel.save();

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
    let responseObject = await userAddToRoom(req.body)
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

            let userName = (await User.findById(userID)).userName;
            Constants.addToFeed(room._id, `"${userName}" left the room`);

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

//Post route to add someone to room
router.post('/add', async (req, res, next) => {

    let { userName, roomName } = req.body;

    let responseObject = { "Result": "Fail", Error: "User not found" }

    let user = (await User.find({ userName: userName }))[0];
    if (user) {
        let userID = user._id;
        responseObject = await userAddToRoom({ userID: userID, roomName: roomName });
    }

    res.send(responseObject);
})

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
    let retObj = {};

    let room = (await RoomModel.find({ roomName: roomName }).select("roomName tasks").populate("tasks").populate("columns.users"))[0];
    if (room) {
        let tasks = [...room['tasks']];
        for (let i = 0; i < tasks.length; i++) {
            let users = await User.find().where('_id').in(tasks[i].columns.users).select("userName");
            tasks[i].columns.users = users;
        }

        retObj['roomName'] = room['roomName'];
        retObj['tasks'] = tasks;

        responseObject['Result'] = "Success";
        responseObject['Error'] = null;
    }

    res.send({ responseObject, retObj })
})

//Input is roomname as query
router.get('/feed', async (req, res, next) => {
    const responseObject = { "Result": "Fail", Error: "Room not found" }

    let roomName = req.query.roomname;
    let room = (await RoomModel.find({ roomName: roomName }))[0];
    let feedModel = (await FeedModel.find({ roomID: room._id }))[0];

    responseObject['Feed'] = feedModel.feed
    responseObject['Error'] = null;
    responseObject['Result'] = "Success"
    res.send(responseObject)

})

//Input is roomname as query
router.get('/chat', async (req, res, next) => {
    const responseObject = { "Result": "Success", Error: null }

    let roomName = req.query.roomname;
    let room = (await RoomModel.find({ roomName: roomName }))[0];

    let chat = room.chat;

    responseObject['Chat'] = chat;
    res.send(responseObject)
})


let userAddToRoom = async (body) => {
    let { userID, roomName } = body;
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

            Constants.addToFeed(room._id, `"${user.userName}" joined the room `)
        }
        else
            responseObject['Error'] = "User already exists in room";

    } else
        responseObject['Error'] = "User not found";

    // res.send(responseObject);
    return responseObject
}


module.exports = router;
