const mongoose = require("mongoose")

const authorSchema = mongoose.Schema({
    name: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String
        }
    },
    dob: {
        type: Date
    },
    address: {
        state:{
            type: String,
            validate:{
                validator: function(stateLength){
                    return stateLength.length >=2 && stateLength.length <=3;
                },
                message: 'Length of state should be between 2 to 3 character'
            }
        },
        suburb:{
            type: String
        },
        street:{
            type: String
        },
        unit:{
            type: String
        }
    }
    ,
    numBooks: {
        type: Number,
        min: 1, max: 150
    }

})

const AuthorModel = mongoose.model("Author", authorSchema)
module.exports = AuthorModel