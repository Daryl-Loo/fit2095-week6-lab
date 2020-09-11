const mongoose = require("mongoose")

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, ref: "Author"
    },
    ISBN: {
        type: Number,
        validate: {
            validator: function (isbnValue) {
                return isbnValue.toString().length === 13;
            },
            message: "ISBN must be 13 digits only"
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    summary: {
        type: String
    }
})

const BookModel = mongoose.model("Book", bookSchema)
module.exports = BookModel