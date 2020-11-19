const express = require('express');
const router = express.Router();
const SplitEase = require('../models/SplitEase');
const Constants = require("../contants");
const User = require('../models/User');

//Add Expense : to,from[], description, value
router.post("/addExpense", async (req, res, next) => {
    let responseObject = {
        Result: "Success", Error: null
    };
    try {

        let { from, to, description, value } = req.body;
        let date = Constants.getTodaysDate();

        if (value > 0) {
            let totalDivisions = (from.length + 1);
            let eachContribution = (value / totalDivisions).toFixed(Constants.FIXED_VALUE_CONSTANTS);

            let splitEase = new SplitEase({
                date: date,
                from: from,
                to: to,
                description: description,
                eachContribution: eachContribution,
                expenseType: "expense"
            });

            (await splitEase.save());
            const splitEaseID = splitEase._id;

            (await Constants.addToExpenseFeed(to, `You added ${description}`, `You get $${(eachContribution * from.length).toFixed(Constants.FIXED_VALUE_CONSTANTS)}`, value, splitEaseID));

            let toUserModel = (await User.findById(to));
            let toUserExpenses = toUserModel.splitEase.expenses;
            toUserExpenses.unshift(splitEaseID);
            toUserModel.splitEase.expenses = toUserExpenses;
            (await toUserModel.save())

            const toUserName = toUserModel.userName;
            for (let f of from) {
                (await Constants.addToExpenseFeed(f, `${toUserName} added ${description}`, `You owe $${eachContribution}`, value, splitEaseID));

                let fromUserModel = await User.findById(f);
                let fromUserExpenses = fromUserModel.splitEase.expenses;
                fromUserExpenses.unshift(splitEaseID);
                fromUserModel.splitEase.expenses = fromUserExpenses;
                (await fromUserModel.save());
            }
        }

        else {
            responseObject.Result = "Fail";
            responseObject.Error = "Value cannot be negative";
        }

        res.send(responseObject);

    }
    catch (err) {
        responseObject.Result = "Fail";
        console.log(err);
        responseObject.Error = err.message;
        res.send(responseObject);
    }
});

//input = expenseID
router.delete("/removeExpense", async (req, res, next) => {
    let responseObject = {
        Result: "Success", Error: null
    };

    try {
        let { expenseID } = req.query;

        let split = await SplitEase.findById(expenseID);
        split.deleted = true;
        (await split.save());
        let description = split.description;
        let from = split.from;
        let to = split.to;
        let totalValue = ((from.length + 1) * split.eachContribution).toFixed(1);

        let toUserModel = (await User.findById(to));
        const toUserName = toUserModel.userName;

        (await Constants.addToExpenseFeed(to, `You deleted ${description}`, `Expense Deleted`, totalValue, expenseID));

        for (let f of from) {
            (await Constants.addToExpenseFeed(f, `${toUserName} deleted ${description}`, `Expense Deleted`, totalValue, expenseID));
        }
        res.send(responseObject)

    } catch (err) {
        responseObject.Result = "Fail";
        console.log(err);
        responseObject.Error = err.message;
        res.send(responseObject);
    }
})

//input is a json with expense id 
//HERE "to" is the person who selected settle up
router.post("/settleup", async (req, res, next) => {
    let responseObject = {
        Result: "Success", Error: null
    };

    try {
        let { to, from, value, description } = req.body;
        let date = Constants.getTodaysDate();

        let paybackExpense = new SplitEase({
            date: date,
            from: from,
            to: to,
            description: description,
            eachContribution: value,
            expenseType: "payback"
        });

        (await paybackExpense.save());
        const paybackExpenseID = paybackExpense._id;

        let toModel = (await User.findById(to));

        let toUserExpenses = toModel.splitEase.expenses;
        toUserExpenses.unshift(paybackExpenseID);
        toModel.splitEase.expenses = toUserExpenses;
        (await toModel.updateOne());

        let fromModel = (await User.findById(from));
        let fromUserExpenses = fromModel.splitEase.expenses;
        fromUserExpenses.unshift(paybackExpenseID);
        fromModel.splitEase.expenses = fromUserExpenses;
        (await fromModel.save());

        (await Constants.addToExpenseFeed(to, `You settled up with ${fromModel.userName}`, `Amount paid $${value}`, value, paybackExpenseID));
        (await Constants.addToExpenseFeed(from, `${toModel.userName} settled up with you`, `Amount paid $${value}`, value, paybackExpenseID));

        res.send(responseObject);

    } catch (err) {
        console.log(err);
        responseObject.Result = "Fail"
        responseObject.Error = err.message;
        res.send(responseObject);

    }

});

//input = req.query userID
router.get("/getExpenses", async (req, res, next) => {
    let responseObject = {
        Result: "Success", Error: null
    };
    let { userID } = req.query;
    let balanceMapObj = await constructBalanceMap(userID);

    responseObject.balanceMap = balanceMapObj.data;
    responseObject.totalBalance = balanceMapObj.totalBalance;

    res.send(responseObject)
})

//input = req.query userID
router.get("/getExpenseFeed", async (req, res, next) => {
    let responseObject = {
        Result: "Success", Error: null
    };

    let { userID } = req.query;

    let userModel = (await User.findById(userID));
    let userFeed = userModel.splitEase.feed;

    // let balanceMapObj = (await constructBalanceMap(userID));
    // responseObject.totalBalance = balanceMapObj.totalBalance;
    responseObject.feed = userFeed;

    res.send(responseObject)
});

//input = req.query userID
router.get("/getTotalBalance", async (req, res, next) => {
    let responseObject = {
        Result: "Success", Error: null
    };

    let { userID } = req.query;

    let balanceMapObj = (await constructBalanceMap(userID));

    responseObject.totalBalance = balanceMapObj.totalBalance;

    res.send(responseObject)
});

//input expense ID from req.query
router.get("/getExpenseDetails", async (req, res, next) => {
    let responseObject = {
        Result: "Success", Error: null
    };

    try {

        let { expenseID } = req.query;

        let expense = (await SplitEase.findById(expenseID).populate("from to"));
        responseObject.data = expense;

        res.send(responseObject)
    }
    catch (err) {
        responseObject.Result = "Fail"
        responseObject.Error = err.message;
        res.send(responseObject);
    }

})


let constructBalanceMap = async (userID) => {
    let balanceMap = {};

    let splitModelsTo = (await SplitEase.find({ to: userID, deleted: false }).populate("from"));
    // console.log("Split model to = ", splitModelsTo);

    for (let splitModel of splitModelsTo) {
        let peopleThatOweMe = splitModel.from;
        for (let person of peopleThatOweMe) {
            if (balanceMap[person._id] == null) {
                balanceMap[person._id] = {
                    _id: person._id,
                    userName: person.userName,
                    balance: 0,
                    expenseID: splitModel._id
                };
            }
            balanceMap[person._id]['balance'] += splitModel.eachContribution;
        }
    }

    let splitModelsFrom = (await SplitEase.find({ from: userID, deleted: false }).populate("to"));
    // console.log("Split model to = ", splitModelsFrom);

    for (let splitModel of splitModelsFrom) {
        // console.log(splitModel._id);
        let personThatIOweTo = splitModel.to;

        if (balanceMap[personThatIOweTo._id] == null) {
            balanceMap[personThatIOweTo._id] = {
                _id: personThatIOweTo._id,
                userName: personThatIOweTo.userName,
                balance: 0,
                expenseID: splitModel._id
            };
        }

        balanceMap[personThatIOweTo._id]['balance'] -= splitModel.eachContribution;
    }

    let totalBalance = 0;
    for (let balance in balanceMap)
        totalBalance += balanceMap[balance].balance;

    totalBalance = totalBalance.toFixed(Constants.FIXED_VALUE_CONSTANTS);

    let obj = {};

    obj.data = balanceMap
    obj.totalBalance = totalBalance
    return obj;
}


module.exports = router;