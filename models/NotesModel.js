const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotesModel = (
    {
        roomId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'RoomModel'
        },

        createdBy: {
            type: Schema.Types.ObjectId, 
            ref: 'User'
        },

        title: {
            type: String,
        },

        shared: {
            type: Boolean,
            default: false,
        },
        
        body: {
            type: String,
        },
        createdOn: {
            type: Date,
        },
        roomName: {
            type: String,
            ref: 'RoomModel'
        }

    }
)

module.exports = mongoose.model('NotesModel', NotesModel);