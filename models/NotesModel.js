const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = (
    {
        roomId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'RoomModel'
        },

        createdBy: {
            type: Schema.Types.ObjectId, ref: 'User'
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
        }

    }
)

module.exports = mongoose.model('NotesModel', notesmodel);