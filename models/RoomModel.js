const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = (
    {
        roomName: {
            type: String,
            required: true,
        },

        members: [{
            type: Schema.Types.ObjectId, ref: 'User'
        }],

        tasks: [{
            type: Schema.Types.ObjectId, ref: 'TaskModel'
        }],

        chat: [],

    }
)

module.exports = mongoose.model('RoomModel', roomSchema);