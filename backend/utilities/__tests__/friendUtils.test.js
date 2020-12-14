'use strict'

const friendUtils = require("../friendUtils");

describe("Tests for friendUtil", () =>{ 

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

  // after adding we should not see an empty array
  test('testing the negative case: we will not have an empty friend array', () => {

    // user1 has the friend list
    let user1 = {
      Username: "thaddg",
      ID: "ndASsYo5I",
      Friends: []
    };

    // user 2 will be added
    let user2 = {
      Username: "Randazzle",
      ID: "RUKz-JNPw",
      Avatar: "test"
    };
    
    expect(
      friendUtils.AddToFriends(user1, user2)
    ).not.toContainEqual( { Friends: [] });

  });

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
})