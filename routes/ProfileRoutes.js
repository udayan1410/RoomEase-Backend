const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RoomModel = require('../models/RoomModel')

// once the route is /profile/, and in the query, you send id and roomID, the information
// of the queried user is sent with the list of the room members and their information.

// input -     localhost:8080/profile?userID=5f86b61873d5736919976c15&roomName=2303
// output -    Success with the userinfo and a list of members 

router.get('/', async (req, res, next) => {

    let responseObject = { "Result": "Fail", Error: "Room / user not found" }
    try{
        let { userID  , roomName } = req.query;
        let uInfo = (await User.find({ _id: userID }))[0];
        let room = (await RoomModel.find({ roomName: roomName }))[0];

        if (uInfo && room) {

            let memberIds = [...room['members']];
            let users = (await User.find().where('_id').in(memberIds).select("userName email roomid phoneNumber"));

            responseObject = {
                'Result'   :  "Success",
                'userInfo' : uInfo,
                'Error' : null,
                'Members' : [...users]
            }
            
        }
    }
    catch(err){
        console.log(err);
        responseObject['Error'] = responseObject["Error"]+" "+err;
    }
    res.send(responseObject);
    
})



/* to change the password of the given user eg: 
   do put- localhost:8080/profile/changePassword 
   and in body you can write - {
    "id":"5f86b62073d5736919976c16",
    "oldpassword":"test",
    "newpassword":"changed"
}
*/

// input - user ID and oldpassword, 
// output- Result = success if pw is changed, fail otherwise.

router.put('/changePassword', async (req,res,next)=> {
    let body = {...req.body};
    
    try{
        let flag = (await User.find({ _id: body.id, password: body.oldpassword  }))[0];
            if(flag){
                await User.updateOne({_id : body.id}, {$set: { "password" : body.newpassword}});
                res.send({"Result": "Success"});
            }
            else 
                res.send({"Result": "Fail"});   
    }
    catch(err){
        res.send(err);   
    }
})


module.exports = router;
