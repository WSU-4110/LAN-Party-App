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
            Avatar: user2.Avatar,
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
    }

}