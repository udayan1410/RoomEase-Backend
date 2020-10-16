const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = (
    {
        userName: {
            type: String,
        },

        email: {
            type: String,
            required: true,
        },

        password: {
            type: String,
            required: true
        },

        phoneNumber: {
            type: String
        },

        roomid: {
            type: Schema.Types.ObjectId, ref: 'RoomModel',
        },

        tasks: [{
            type: Schema.Types.ObjectId, ref: 'TaskModel',
        }]

    }
);
module.exports = mongoose.model('User', userSchema);