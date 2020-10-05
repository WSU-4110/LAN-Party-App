const mongoose = require('mongoose')

const connection = "mongodb+srv://username:<password>@<cluster>/<database>?retryWrites=true&w=majority"

mongoose.connect(connection,{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => console.log("Database Connected Successfully"))
    .catch(err => console.log(err))