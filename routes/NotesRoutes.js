const express = require('express');
const router = express.Router();
const RoomModel = require('../models/RoomModel');
const NotesModel = require('../models/NotesModel');

const User = require('../models/User');
const Constants = require("../contants");
const e = require('express');

//input : roomname, uid, notetitle, body, shared
router.post('/create', async (req, res, next) => {

    let responseObject = { "Result": "Fail", "err": "Cannot create note/roomname not found." }

    try {
        let { userID, roomName, noteTitle, body, shared } = req.body;
        let createdOn = Constants.getTodaysDate();
        if(shared==null) shared = false;
        let room = null;
        let user = (await User.findById(userID));
        if(roomName != null) {
            room = (await RoomModel.find({ roomName: roomName }))[0];
            if (user) {
                let notes = new NotesModel({roomId: user.roomid, createdOn: createdOn, 
                    title: noteTitle, shared: shared, body: body, createdBy: userID, roomName: roomName
                });
                user.notes.push(notes._id);
                if(shared === true ){
                    room.notes.push(notes._id);
                    await room.save();
                }
                await user.save();
                await notes.save();
                responseObject['Result'] = 'Success';
                responseObject['Error'] = null;
                responseObject['notesData'] = notes;                
            }
            else {
                responseObject['Result'] = 'Fail';
                responseObject['Error'] = "Unknown error: No user.";
            }
        }
        else {
            if (user) {
                let notes = new NotesModel({ createdOn: createdOn, title: noteTitle, shared: false, body: body, createdBy: userID });
                user.notes.push(notes._id);
                await user.save();
                await notes.save();
                responseObject['Result'] = 'Success';
                responseObject['Error'] = null;
                responseObject['notesData'] = notes;                
            }
            else {
                responseObject['Result'] = 'Fail';
                responseObject['Error'] = "Unknown error: No user.";
            }
        }
        res.send(responseObject)
    }
    catch (err) {
        responseObject["err"] = "Something went wrong";
        responseObject.Error = err;
        res.send(responseObject);
    }

});

// input = request query = roomname.
router.get('/roomnotes', async (req, res, next) => {

    const responseObject = { "Result": "Fail", "err": "Error" }
    
    try{
        let {roomname} = req.query;
        let notes = await NotesModel.find( {roomName:roomname, shared:true} );

        if (notes) {
            responseObject["Result"] = "Success";
            responseObject["Error"] = null;
            responseObject['notes'] = notes;
        }
        res.send(responseObject)
    }
    catch(err){
        responseObject.Error = err;
        res.send(responseObject)
    }
})

// input = request query = roomname, userid.
router.get('/selfnotes', async (req, res, next) => {

    const responseObject = { "Result": "Fail", "err": "Error" }
    try{    
        let {userID} = req.query;
        let notes = await NotesModel.find( {createdBy : userID} );

        if (notes) {
            responseObject["Result"] = "Success";
            responseObject["Error"] = null;
            responseObject['notes'] = notes;
        }
        res.send(responseObject)
    }
    catch(err){
        responseObject.Error = err;
        res.send(responseObject);
    }
})

// input = request query = noteid.
router.get('/', async (req, res, next) => {
    const responseObject = { "Result": "Fail", "err": "Error" }
    try{
        let {noteid} = req.query;
        let notes = await NotesModel.find( {_id : noteid} );
        if (notes) {
            responseObject["Result"] = "Success";
            responseObject["Error"] = null;
            responseObject['notes'] = notes;
        }
        res.send(responseObject)
    }
    catch(err){
        responseObject["Error"] = err;
        res.send(responseObject);
    }
})

// input: shared, _id, createdOn, title, body, createdBy, userid
router.patch('/', async (req,res,next) => {
    const responseObject = {"Result": "Fail", "err": "Unknown Error"};
    try{
        let {shared, _id, createdOn, title, body, createdBy, userID } = req.body;
        let note = await NotesModel.findById(_id);
        let user = await User.findById(userID);
        if(user.roomid == null){
            shared = false;
            if(note){
                await NotesModel.findByIdAndUpdate(_id, { shared, createdOn, title, body, createdBy })
                responseObject['notes'] = ( await NotesModel.findById(_id) );
                responseObject['Error'] = null;
                responseObject['Result'] = "Success";
            }
        }
        else{
            let room = await RoomModel.findById(user.roomid);
            if(user && room && note){
                if(!note.shared && shared){
                    room.notes.push(note._id);
                    await room.save();
                }
                else if(note.shared && !shared){
                    room.notes.splice(room.notes.indexOf(note._id),1);
                    await room.save();
                }
                await NotesModel.findByIdAndUpdate(_id, { shared, createdOn, title, body, createdBy, roomName: room.roomName })
                responseObject['notes'] = ( await NotesModel.findById(_id) );
                responseObject['Error'] = null;
                responseObject['Result'] = "Success";
            }
        }
        
        res.send(responseObject);
    }
    catch(err){
        responseObject.Error = err;
        res.send(responseObject);
    }
});

// input: {_id, createdBy, roomName, userID, shared
router.delete('/', async (req, res, next) => {
    const responseObject = {"Result": "Fail", "err": "Cannot delete. (no user / note found)"};
    try {
      let { noteid, userID } = req.query;
      let user = await User.findById(userID);
      let note = await NotesModel.findById(noteid);
      if (note.createdBy != userID) {
        responseObject["Error"] =
          "Cannot delete, the current user is not the owner of the note.";
        res.send(responseObject);
      } 
      else {
        if (user) {
          if (user.roomid != null) {
            let room = await RoomModel.findById(user.roomid);
            console.log(room);
            let room_notes = room.notes;
            if (room_notes.includes(noteid))
              room_notes.splice(room_notes.indexOf(noteid), 1);
            room.save();
          }
          let user_notes = user.notes;
          if (user_notes.includes(noteid))
            user_notes.splice(user_notes.indexOf(noteid), 1);
          user.save();
        }

        let del = await NotesModel.deleteOne({ _id: noteid });
        if (del.deletedCount > 0) {
          responseObject["Result"] = "Success";
          responseObject["Error"] = null;
        }
        res.send(responseObject);
      }
    }
    catch (err){
        responseObject.Error = err;
        res.send(responseObject);
    }
});

module.exports = router;