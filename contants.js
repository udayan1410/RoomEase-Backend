const FeedModel = require('./models/FeedModel');
const User = require('./models/User');

let ASSIGNED = "ASSIGNED";
let FIXED_VALUE_CONSTANTS = 2;

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


let addToExpenseFeed = async (id, feedString, subheading, value, expenseID) => {

    let user = await User.findById(id);
    let userFeed = user.splitEase.feed;

    let feedObject = {
        expenseID: expenseID,
        description: feedString,
        subheading: subheading,
        value: value,
        date: getTodaysDate()
    }

    userFeed.unshift(feedObject);

    user.splitEase.feed = userFeed;

    await user.save();

}

module.exports = {
    ASSIGNED, ASSIGNED,
    getRandomColor: getRandomColor,
    getTodaysDate: getTodaysDate,
    addToFeed: addToFeed,
    addToExpenseFeed: addToExpenseFeed,
    FIXED_VALUE_CONSTANTS: FIXED_VALUE_CONSTANTS,
}