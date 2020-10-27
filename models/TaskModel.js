const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskmodel = (
    {
        taskName: {
            type: String,
            required: true,
        },

        columns: {
            daysOfTheWeek: [],
            timeOfDay: String,
            users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            taskStatus: [],
        },

        comments: {
            type: String,
        },

        createdOn: {
            type: String,
        },

        color: String
    }
)

module.exports = mongoose.model('TaskModel', taskmodel);