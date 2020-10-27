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
|/Accounts/{ID}|PATCH|update an account's username, password, and/or email|Email, Password|NewUsername, NewPassword, NewEmail|
|/CreateParty|POST|create party|?|?|
|/Party/{ID}|GET|get party by ID|N/A|N/A|
|/Parties|GET|get all parties|N/A|N/A|
|/Party/{ID}/Update|PATCH|update a party|?|?|

# Schema
## Account
{
Email:
Password:
Username:
}
## Party
{
}
## Friend
{
}
## Game
{
}
