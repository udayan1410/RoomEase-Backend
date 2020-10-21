const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedmodel = (
    {
        roomID: {type: Schema.Types.ObjectId, ref:'RoomModel'},
        feed:[]

    }
);

module.exports = mongoose.model('FeedModel', feedmodel);
