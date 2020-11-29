// unit test for removing a friend from a user's friend list

const friendUtils = require("../utilities/friendUtils");

// after deleting we should not see the friend in user1's list anymore
test('we will not see a user in the friend list after deleting', () => {

  // we can make two random users
  let user1 = {
    Username: "thaddg",
    ID: "ndASsYo5I",
    Friends: [
      {
        Username: "Randazzle",
        ID: "RUKz-JNPw"
      }
    ]
  };

  let user2 = {
    Username: "Randazzle",
    ID: "RUKz-JNPw",
    Friends: [
      {
        Username: "thaddg",
        ID: "ndASsYo5I"
      }
    ]
  };
  
  expect(
    friendUtils.RemoveFromFriends(user1, user2)
  ).not.toEqual(expect.objectContaining({ Username: "Randazzle" }));
});