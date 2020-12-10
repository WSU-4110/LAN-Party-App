# LAN-Party-App
New repo for the lan party app. Both the frontend and backend in one place

This folder is the backend code for our app. We are using Serverless and DynamoDB.

## Developers
- Logan Nguyen, ga2599@wayne.edu
- Jarred Crull, gj3842@wayne.edu
- Randall Smith, er3586@wayne.edu

# Sprint 1 code
Front end: https://github.com/WSU-4110/LAN-party-frontend
Back end: https://github.com/WSU-4110/LAN-party-backend

# Enviroments

# Usage
| Endpoint | Type | Function | Critical JSON Fields | Optional JSON Fields |
|---|---|---|---|---|
|/SignUp|POST|create a new account|Username, Email, Password|N/A|
|/SignIn|POST|sign in to an account|Email, Password|N/A|
|/Account/{ID}|GET|get user by ID|N/A|N/A|
|/Accounts|GET|get all accounts|N/A|N/A|N/A|
|/Account/{ID}|PATCH|update an account's info|N/A|Avatar, NewUsername, NewPassword, NewEmail|
|/UpdateGames/Account/{ID}|PATCH|update an account's favorite games|N/A|Add, Remove|
|/CreateParty|POST|create party|PartyName, Host, PartyLocation, PartyTime|Games, HardwareRequirements, Intent, AgeGate|
|/Party/{ID}|GET|get party by ID|N/A|N/A|
|/Parties|GET|get all parties|N/A|N/A|
|/Party/{ID}/Update|PATCH|update a party|N/A|PartyName, Host, PartyLocation, PartyTime, Games, HardwareRequirements, Intent, AgeGate|
|/Invite/Pary/{ID}|PATCH|invite someone to a party|N/A|N/A|
|/PartyRequestLocation/{ID}|PATCH|request a location for the party|N/A|N/A|
|/CreateGame|POST|create a new game|GameName, Genre|N/A|
|/Game/{ID}|GET|get a game by ID|N/A|N/A|
|/Games|GET|get all the games|N/A|N/A|
|/Report/{ID}|GET|get a report by ID|N/A|N/A|
|/Reports|GET|get all reports|N/A|N/A|
|/ReportAccount|POST|report a user|ReportedAccountID, AccuserID, Message|N/A|
|/AddFriend/Account/{ID}|PATCH|general update function|Request, Confirmed|N/A|
|/AddFriend/Account/{ID}|PATCH|remove a friend|Remove|N/A|
|/AddFriend/Account/{ID}|PATCH|remove a friend request|RemoveRequest|N/A|
|/Image/Upload|POST|upload an image to s3|N/A|N/A|

# Schema
## Account
{
CreateDate:
UpdateDate:
Avatar:
Email:
Password:
Username:
Invites:
Friends: []
FriendRequests: []
}
## Party
{
CreateDate:
PartyName:
PartyLocation: { Longitude, Latitude }
PartyTime:
Host:
HostUsername:
HardwareReq:
Intent:
ID:
RequestLocationChange:
MinAge:
Games: []
RequestLocationChange:
Notes:
Attendees: { Username, ID }
Invited:
}
## Game
{
CreateDate:
ID:
GameName:
Genre:
}
## Reports
{
CreateDate:
ReportedAccountID:
Message:
ID:
AccuserID:
}
