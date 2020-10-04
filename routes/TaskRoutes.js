const express = require('express');
const router = express.Router();
const Task = require('../models/TaskModel');
const RoomModel = require('../models/RoomModel');
const User = require('../models/User');


// All task model data and roomname
router.post('/create', async (req, res, next) => {
    let responseObject = { "Result": "Fail", "Error": "Room does not exist" }

    let { taskName, columns, comments, roomName, createdOn } = req.body;

    let room = (await RoomModel.find({ roomName: roomName }))[0];

    if (room) {
        let task = new Task({ taskName, columns, comments, status: "incomplete", createdOn })

        let users = (await User.find().where('_id').in(task.columns.users));

        for (let user of users) {
            user.tasks.push(task._id);
            user.save();
        }

        room.tasks.push(task);

        await room.save();
        await task.save();

        responseObject['Error'] = null;
        responseObject['Result'] = "Success"
    }
    res.send(responseObject);
})




module.exports = router;