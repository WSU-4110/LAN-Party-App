// unit test for removing a user from a user's friend request list

const friendUtils = require("../utilities/friendUtils");

// after deleting we should NOT see randazzle in the friend request list
test('deleting a user from a friend request list means they wont be there anymore', () => {

  // user1 has the list
  let user1 = {
    Username: "thaddg",
    ID: "ndASsYo5I",
    FriendRequests: [
      {
        Sender: true,
        Username: "Randazzle",
        ID: "RUKz-JNPw"
      }
    ]
  };

  // we are removing user2
  let user2 = {
    Username: "Randazzle",
    ID: "RUKz-JNPw",
  };
  
  expect(
    friendUtils.RemoveFromFriends(user1, user2)
  ).not.toEqual({
    FriendRequests: [
      {
        Sender: true,
        Username: "Randazzle",
        ID: "RUKz-JNPw"
      }
    ]
  });

});