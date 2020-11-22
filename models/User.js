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
        }],

        notes: [{
            type: Schema.Types.ObjectId, ref: 'NotesModel',
        }],


        splitEase: {
            feed: [{
                description: {
                    type: String
                },
                subheading: {
                    type: String
                },
                value: {
                    type: Number
                },
                date: {
                    type: String
                },
                expenseID: {
                    type: Schema.Types.ObjectId, ref: 'SplitEase',
                }
            }],
            expenses: [
                { type: Schema.Types.ObjectId, ref: 'SplitEase', }
            ]
        }
    }
);
module.exports = mongoose.model('User', userSchema);