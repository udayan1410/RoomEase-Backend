const FeedModel = require('./models/FeedModel');

let ASSIGNED = "ASSIGNED";

let getRandomColor = () => parseInt(Math.random() * 256)

let getTodaysDate = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let createdOn = new Date();
    createdOn = `${monthNames[createdOn.getMonth()]} ${createdOn.getDate()} ${createdOn.getFullYear()}`;
    return createdOn;
}

let addToFeed = async (roomID, feedString) => {
    let createdOn = getTodaysDate();
    let feedModel = (await FeedModel.find({ roomID: roomID }))[0];

    let feed = feedModel.feed;

    let feedData = {
        createdOn: createdOn,
        message: feedString
    }

    feed.unshift(feedData);

    feedModel.feed = feed;
    feedModel.save();
}


module.exports = {
    ASSIGNED, ASSIGNED,
    getRandomColor: getRandomColor,
    getTodaysDate: getTodaysDate,
    addToFeed: addToFeed,
}