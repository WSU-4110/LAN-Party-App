//** The schema for the datbase, User **//

const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log('Connecting to', url)
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        maxlength: 50,
        required: true
    },
    first_name: {
        type: String,
        maxlength: 50,
        required: true
    },
    last_name: {
        type: String,
        maxlength: 50,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        minlength: 5,
        required: true
    }
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
    }
})

module.exports = mongoose.model("User", userSchema, "users")