const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RoomModel = require('../models/RoomModel')

router.get('/', async (req, res, next) => {

    const responseObject = { "Result": "Fail", Error: "Room / user not found" }
    try{
        let { userID  , roomName } = req.query;

        let uInfo = (await User.find({ _id: userID }))[0];
        console.log(JSON.stringify(uInfo));

        let room = (await RoomModel.find({ roomName: roomName }))[0];
        if (uInfo && room) {

            let memberIds = [...room['members']];

            let users = (await User.find().where('_id').in(memberIds).select("userName email roomid"));

            responseObject['userInfo'] = uInfo;
            responseObject['Result'] = "Success";
            responseObject['Error'] = null;
            responseObject['Members'] = [...users];
        }
    }
    catch(err){
        responseObject['Error'] = err;
    }
    res.send(responseObject);
    

    // res.send({})
    // let userInfo = await User.findById(userID);
    // let roomInfo = await Room.find({roomName:roomName});
    // let ids = roomInfo[0].members;
    // let m1 = [];
    // // for(let r in ids) {m1.push(await User.findById(r).userName); console.log(r);}
    // for(let i=0;i<ids.length;i++){
    //     let temp = await User.findById(ids[i]);
    //     m1.push(temp.userName);
    // }
    // let members = await User.findById(roomInfo[0].members);
    // console.log(m1);

    
})

router.post('/:id', (req, res, next) => {

    let user = new User({ ...req.body });
    res.send(user)
})

// router.post('/tanmay', (req, res, next) => {
//     let username = req.body.userName;
//     let roomname = req.body.roomName;
    
//     let user = new User({ ...req.body });
//     let 
//     res.send(userName)
// })



module.exports = router;
