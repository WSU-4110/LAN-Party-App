// unit test for the username check function

const PartyCheck = require("../utilities/PartyCheck");

// test a valid username
test('testing to see if a username is okay', () => {
  expect(
    PartyCheck.isValidUserName("david98")
  ).toEqual(true);
});

// test a invalid username
test('testing to see if a username is NOT okay', () => {
  expect(
    PartyCheck.isValidUserName("awesome user90")
  ).not.toEqual(true);
});
