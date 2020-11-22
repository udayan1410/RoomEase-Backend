const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const splitEaseSchema = (
    {
        date: {
            type: String
        },

        description: {
            type: String
        },

        eachContribution: {
            type: Number
        },

        from: [{
            type: Schema.Types.ObjectId, ref: 'User',
        }],

        to: {
            type: Schema.Types.ObjectId, ref: 'User',
        },

        deleted: {
            type: Boolean,
            default: false
        },

        expenseType: {
            type: String
        }

    }
);
module.exports = mongoose.model('SplitEase', splitEaseSchema);