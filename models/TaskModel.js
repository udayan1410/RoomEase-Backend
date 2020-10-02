const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskmodel = (
    {
        taskName: {
            type: String,
            required: true,
        },

        columns: {
            days: [],
            timeOfDay: [],
            users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        },

        comments: {
            type: String,
        },

        createdOn: {
            type: Date,
        },

        status: {
            type: String
        }

    }
)

module.exports = mongoose.model('TaskModel', taskmodel);