const express = require('express');
const router = express.Router();
const RoomModel = require('../models/RoomModel');
const NotesModel = require('../models/NotesModel');

const User = require('../models/User');
const Constants = require("../contants");

//input : roomname, uid, notetitle, body
router.post('/create', async (req, res, next) => {

    let responseObject = { "Result": "Fail", "Error": "Cannot create note/roomname not found." }

    try {
        let { userID, roomName, noteTitle, body, shared } = req.body;
        let createdOn = Constants.getTodaysDate();
        if(shared==null) shared = false;
        let room = (await RoomModel.find({ roomName: roomName }))[0];
        
        if (room) {
            let user = (await User.findById(userID));
            if (user && user.roomid != null) {
                let notes = new NotesModel({roomId: user.roomid, createdOn: createdOn, title: noteTitle, 
                    shared: shared, body: body, createdBy: userID,roomName: roomName
                });
                
                await notes.save();

                responseObject['Result'] = 'Success';
                responseObject['Error'] = null;
                responseObject['notesData'] = notes;
            }

            else {
                responseObject['Result'] = 'Fail';
                responseObject['Error'] = "Unknown error: No room.";
            }
        }
        res.send(responseObject)
    }
    catch (err) {
        responseObject.Error = "Something went wrong";
        res.send(responseObject)
    }

});

// input = request query = roomname, userid.
router.get('/', async (req, res, next) => {

    const responseObject = { "Result": "Fail", Error: "Error" }
    let {roomname, userID} = req.query;
    let notes = await NotesModel.find( {$and: [{roomName:roomname}, { $or: [ {shared:true},{createdBy:userID} ]}]});

    if (notes) {
        responseObject["Result"] = "Success";
        responseObject["Error"] = null;
    }
    responseObject['notes'] = notes;
    res.send(responseObject)
})

// input: shared, _id, roomId, createdOn, title, body, createdBy, roomName
router.patch('/', async (req,res,next) => {
    const responseObject = {"Result": "Fail", Error: "Unknown Error"};
    let {shared, _id, roomId, createdOn, title, body, createdBy, roomName, userID} = req.body;
    let note = await NotesModel.findById(_id);
    if(note){
        await NotesModel.findByIdAndUpdate(_id, { shared, roomId, createdOn, title, body, createdBy, roomName })
    }
    responseObject['notes'] = ( await NotesModel.findById(_id) );
    responseObject['Error'] = null;
    responseObject['Result'] = "Success";
    res.send(responseObject);
});

// input: {_id, createdBy, roomName, userID, shared
router.delete('/', async (req, res, next) => {
    const responseObject = {"Result": "Fail", Error: "Cannot delete."};
    let {_id, createdBy, roomName, userID} = req.body;
    let notes = await NotesModel.findById(_id);
    if(notes && (notes.createdBy===userID || notes.shared===true)){
        console.log(await NotesModel.deleteOne({_id: _id}));
        responseObject['Result'] = "Success";
        responseObject['Error'] = null;
    }
    else {
        responseObject['Result'] = "Failed";
        responseObject['Error'] = "Error, note not found"
    }
    res.send(responseObject);

});

module.exports = router;