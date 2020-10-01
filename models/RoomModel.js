const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = (
    {
        roomid: {
            type: String,
            required: true,
        },

        roomName: {
            type: String,
            required: true,
        },

        users: [{
            type: Schema.Types.ObjectId, ref: 'User'
        }],

        tasks: [{
            type: Schema.Types.ObjectId, ref: 'Task'
        }]

    }
)

module.exports = mongoose.model('RoomModel', roomSchema);