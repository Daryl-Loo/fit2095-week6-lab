const mongoose = require("mongoose")

const authorSchema = mongoose.Schema({
    name: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: false
        }
    },
    dob: {
        type: Date,
        required: false
    },
    address: {
        state:{
        required: false,
            type: String,
            validate:{
                validator: function(stateLength){
                    return stateLength.length >=2 && stateLength.length <=3;
                },
                message: 'Length of state should be between 2 to 3 character'
            }
        },
        suburb:{
            required: false,
            type: String
        },
        street:{
            required: false,
            type: String
        },
        unit:{
            required: false,
            type: String
        }
    }
    ,
    numBooks: {
        required: false,
        type: Number,
        min: 1, max: 150
    }

})

const AuthorModel = mongoose.model("Author", authorSchema)
module.exports = AuthorModel