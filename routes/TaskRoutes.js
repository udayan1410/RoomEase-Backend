const express = require('express');
const router = express.Router();
const Task = require('../models/TaskModel');
const RoomModel = require('../models/RoomModel');
const User = require('../models/User');
const Constants = require('../contants');
const TaskModel = require('../models/TaskModel');


// All task model data and roomname
router.post('/create', async (req, res, next) => {

    let responseObject = { "Result": "Fail", "Error": "Room does not exist" }

    let { taskName, columns, comments, roomName, createdOn, userID } = req.body;

    let room = (await RoomModel.find({ roomName: roomName }))[0];

    let redShade = Constants.getRandomColor();
    let greenShade = Constants.getRandomColor();
    let blueShade = Constants.getRandomColor();

    if (room) {
        let taskStatus = [];

        for (let user in columns.users)
            taskStatus.push(Constants.ASSIGNED);

        columns.taskStatus = taskStatus;
        color = `rgb(${redShade},${greenShade},${blueShade})`
        let task = new Task({ taskName, columns, comments, createdOn, color })

        let users = (await User.find().where('_id').in(task.columns.users));

        for (let user of users) {
            user.tasks.push(task._id);
            user.save();
        }

        room.tasks.push(task);

        await room.save();
        await task.save();


        let userName = (await User.findById(userID)).userName;

        Constants.addToFeed(room._id, `Task Created "${task.taskName}" by "${userName}"`);

        responseObject['Error'] = null;
        responseObject['Result'] = "Success"
    }
    res.send(responseObject);
})


// Getting a particular task from DB 
// Input will be provided with query params
router.get("/", async (req, res, next) => {

    let responseObject = { "Result": "Fail", "Error": "Task not Found" };

    let task = await TaskModel.findById(req.query.taskid);

    if (task) {
        let { taskName, columns, comments, createdOn, _id, color } = task;

        let taskObj = {};

        let users = columns.users;
        columns.users = [];

        let userModels = [];
        for (let user of users) {
            let userModel = await User.findById(user);
            userModels.push(userModel);
        }

        columns.users = [...userModels];

        taskObj['taskName'] = taskName;
        taskObj['columns'] = columns;
        taskObj['comments'] = comments;
        taskObj['createdOn'] = createdOn;
        taskObj['color'] = color;


        responseObject['Result'] = "Success";
        responseObject['Error'] = null;
        responseObject['Task'] = taskObj;
        responseObject['_id'] = _id;
    }

    res.send(responseObject)

});


//Input will be json body of task
router.patch('/', async (req, res, next) => {
    let responseObject = { "Result": "Fail", "Error": "Taskname cannot be empty" }

    let { taskName, columns, comments, roomName, taskID, userID } = req.body;

    if (taskName.length == 0)
        res.send(responseObject);

    let previousUsers = (await TaskModel.findById(taskID)).columns.users;
    let newUsers = columns.users.map(user => user._id);

    let previousUsersMap = {};
    let newUsersMap = {};

    for (let previousUser of previousUsers)
        previousUsersMap[previousUser] = previousUser;

    for (let newUser of newUsers)
        newUsersMap[newUser] = newUser;

    for (let previousUser in previousUsersMap) {
        //Present in previous but removed in new
        //Remove that task from users's tasks
        if (newUsersMap[previousUser] == null) {
            let user = await User.findById(previousUser);
            let tasks = user.tasks;
            tasks.splice(tasks.indexOf(taskID), 1);
            user.tasks = tasks;
            user.save();
        }
    }

    for (let newUser in newUsersMap) {
        //Present in newUsers but not in previous that means need to append that task to tasks 
        if (previousUsersMap[newUser] == null) {
            let user = await User.findById(newUser);
            let tasks = user.tasks;
            tasks.push(taskID);
            user.tasks = tasks;
            user.save();
        }
    }

    await TaskModel.findByIdAndUpdate(taskID, { taskName, columns, comments })

    responseObject['Error'] = null;
    responseObject['Result'] = "Success"

    let roomID = (await RoomModel.find({ roomName: roomName }))[0]._id;
    let userName = (await User.findById(userID)).userName;

    Constants.addToFeed(roomID, `Task Updated  "${taskName}" by "${userName}"`)

    res.send(responseObject);
})

//Delete  a task
router.delete('/', async (req, res, next) => {
    let responseObject = { "Result": "Fail", "Error": "Task not found" }

    let taskID = req.query.task;
    let roomName = req.query.roomname;

    let room = (await RoomModel.find({ roomName: roomName }))[0];

    if (room) {
        let roomTasks = [...room.tasks];
        let roomMembers = room.members;

        for (let i = 0; i < roomTasks.length; i++)
            roomTasks[i] = roomTasks[i] + "";

        roomTasks.splice(roomTasks.indexOf(taskID), 1);
        room.tasks = roomTasks
        room.save();

        let users = (await User.find().where('_id').in(roomMembers));

        for (let user of users) {
            let userTasks = user.tasks;
            userTasks.splice(userTasks.indexOf(taskID), 1);
            user.tasks = userTasks;
            user.save();
        }

        let taskName = (await TaskModel.findById(taskID)).taskName;

        await TaskModel.findByIdAndDelete(taskID);
        responseObject['Error'] = null;
        responseObject['Result'] = "Successs";

        Constants.addToFeed(room._id, `Task Deleted "${taskName}"`)
    }

    res.send(responseObject);
})


module.exports = router;