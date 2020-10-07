//////////////////////////////////////////////////////////////////
//** Temp Testing *//
//////////////////////////////////////////////////////////////////

// Let's upload some defult users to the database
const test_user = new User({
    first_name: "Randall",
    last_name: "Smith",
    email: "randall@gmail.com",
    password: "pass123"
})

test_user.save().then(savedUser => {
    response.json(savedUser.toJSON())
    console.log('user saved!')
})