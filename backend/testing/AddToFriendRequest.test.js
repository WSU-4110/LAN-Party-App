// unit test for adding a friend from a user's friend request list

const friendUtils = require("../utilities/friendUtils");

// after adding we should not see an empty request array
test('testing the negative case: we will not have an empty friend request array', () => {

  // user1 has the friend list
  let user1 = {
    Username: "thaddg",
    ID: "ndASsYo5I",
    FriendRequest: []
  };

  // user 2 will be added
  let user2 = {
    Username: "Randazzle",
    ID: "RUKz-JNPw",
    Avatar: "test"
  };
  
  expect(
    friendUtils.AddToFriends(user1, user2)
  ).not.toContainEqual( { FriendRequest: [] });

});