const genUtils = require('./generalUtils')

module.exports = {
    //=========================================================================
    // Takes in two users, adds user 2 to user 1's Friend Request array.
    // If user 1 is the user1, then make sure user1 is true
    // Otherwise, make sure it's false.
    // Returns false if user 2 in user 1's friend request array
    // Otherwise, returns user 1's new friend request array
    //=========================================================================
    addToFriendRequests: async function (user1, user2, sender){
        //If the user1 has no friends, make sure the item is at least initialized
        if(!user1.hasOwnProperty('FriendRequests')){
            user1.FriendRequests = [];

        //If the user already has a friend request w/ them, prevent them
        } else if (user1.FriendRequests.findIndex( FrenReq => 
            FrenReq.ID === user2.ID ) !== -1){
            return false;
        }

        let saveItem = {
            ID: user2.ID,
            Username: user2.Username,
            Sender: sender
        }

        user1.FriendRequests.unshift(saveItem);

        return user1.FriendRequests;
    },

    //=========================================================================
    // Takes in two users, removes user 2 from user 1's Friend Request array.
    // Output has 2 attributes: deleted is the item that was removed
    // FriendRequests is the updated array for user 1
    // Returns false if user 2 is not in user 1's friend request array
    //=========================================================================
    removeFromFriendRequests: async function (user1, user2){
        //let friendReqInd = await genUtils.isInSortedList(user2, user1.FriendRequests);
        let friendReqInd = user1.FriendRequests.findIndex(user => user.ID === user2.ID)
        if(friendReqInd === -1){
            return false;
        }

        let output = {}
        output.deleted = user1.FriendRequests.splice(friendReqInd, 1)[0];
        output.FriendRequests = user1.FriendRequests;

        return output;
    },

    //=========================================================================
    // Takes in two users, adds user 2 to user 1's Friend array.
    // Output is the new Friends array for user 1 if the friend is new
    // or false if user 2 is already in the friends array
    //=========================================================================
    AddToFriends: async function (user1, user2){
        //Values to store in the user1's table.
        let storeVal = {
            ID: user2.ID,
            Username: user2.Username,
            Avatar: user2.Avatar
        }

        //Insert the friend such that it's sorted by ID
        user1.Friends = await genUtils.insertSorted(storeVal, user1.Friends);

        return user1.Friends;
    },

    //=========================================================================
    // Takes in two users, removes user 2 to user 1's Friend array.
    // Output is the new Friends array for user 1 if user 2 is successfully removed,
    // Or false if user 2 was not in the array
    //=========================================================================
    RemoveFromFriends: async function (user1, user2){
        //If the user2 user is not in the user1's friends, 403
        let friendLoc = await genUtils.isInSortedList(user2, user1.Friends);

        if(friendLoc === false){
            return false;
        }

        //Remove the user from the user1's friends
        user1.Friends.splice(friendLoc, 1);

        return user1.Friends;
    },

    //Remove friend request Callback
    RemoveFriendRequestCallback: async function(user1, user2){
        const updateExpression = "Set FriendRequests=:r"
        //Remove the friendRequest from the user2's array
        let updatedFriendReqs = await friendUtil.removeFromFriendRequests(user1, user2);

        if (updatedFriendReqs === false){
            return responseUtil.Build(403, "User not in " + user1.Username +"'s friend request array");
        }

        //Set the updated friend requests to the Friend requests array
        updatedFriendReqs = updatedFriendReqs.FriendRequests;

        //Update the values
        let updateValues = {
            ':r': updatedFriendReqs
        };

        //Save the item
        try {
            response = await AccountAPI.Update(user1, updateValues, updateExpression);
            //If it could not save
        } catch (err) {
            return responseUtil.Build(500, "Could not save to " + user1.Username);
        }
        if (response === false){
            return responseUtil.Build(500, "Could not save to " + user1.Username);
        }

        return true;
    },

    RemoveFriendsCallback: async function(user1, user2){
        //Set the request statement
        const requestExpression = 'Set Friends = :f'

        //Get the updated friends list
        let updatedFriends = await friendUtil.RemoveFromFriends(user1, user2);
        //If the user2 was not in the list
        if(updatedFriends === false){
            return responseUtil.Build(403, "User not in " + user1.Username + "'s friend array");
        }
        console.log(updatedFriends);
        //Set the expression value
        let expressionValue = {
            ':f': updatedFriends
        }
        
        //Save to the account
        try {
            response = await AccountAPI.Update(user1, expressionValue, requestExpression);
        
        //Any errors saving to the account
        } catch (err) {
            return responseUtil.Build(500, "Error saving to " + user1.Username)
        }
        if(response === false){
            return responseUtil.Build(500, "Error saving to " + user1.Username)
        }

        return true;
    },

    ConfirmFriendCallback: async function (user1, user2, isSender){
        const updateExpression = 'set Friends = :f, FriendRequests = :r';

        //Remove the user2 from the user1's friend request
        let updatedFriendReqs = await friendUtil.removeFromFriendRequests(user1, user2);

        //If the item wasn't in there
        if(updatedFriendReqs === false){
            return responseUtil.Build(403, "User not in " + user1.Username + "'s Friend Requests");
        
        //If the user1 of this request also sent the friend request
        } else if (updatedFriendReqs.deleted.Sender === isSender){
            return responseUtil.Build(403, 'Cannot confirm request you sent!');

        //Set the value to the new friend request array
        } else {
            updatedFriendReqs = updatedFriendReqs.FriendRequests;
        }

        //Update the friend request array
        let updatedFriends = await friendUtil.AddToFriends(user1, user2);

        if(updatedFriends === false){
            return responseUtil.Build(403, "User already in "+ user1.Username + "'s friends!")
        }

        let updateValues = {
            ':f' : updatedFriends,
            ':r' : updatedFriendReqs
        }

        console.log(updateValues);

        try {
            response = await AccountAPI.Update(user1, updateValues, updateExpression);
        } catch (err) {
            return responseUtil.Build(500, "Could not add friend to " + user1.Username);
        }
        if(response === false){
            return responseUtil.Build(500, "Could not add friend to " + user1.Username);
        } 

        return true;
    },

    RequestFriendCallback: async function (user1, user2, sender){
        const updateExpression = 'SET FriendRequests =:f'

        //Get the updated friends list
        let updatedFriendReqs = await friendUtil.addToFriendRequests(user1, user2, sender);
        
        if(updatedFriendReqs === false){
            return responseUtil.Build(403, 'Tried sending friend request to self');
        }
        
        let updateValues = {
            ':f': updatedFriendReqs
        };


        try {
            response = await AccountAPI.Update(user1, updateValues, updateExpression);
        } catch (err) {
            return responseUtil.Build(500, "Could not update friends list of " + user1.Username);
        }
        if(!response){
            return responseUtil.Build(500, "Could not update friends list of " + user1.Username);
        } 
        return true;
    }
}