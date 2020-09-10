const Author = require("./models/Author.js")
const Book = require("./models/Book.js")

const randomstring = require('randomstring')
const mongoose = require('mongoose');

let express = require('express');
let app = express();
const bodyParser = require('body-parser');
app.use(express.static('images'))   //put static stuff here
app.use(bodyParser.urlencoded({extended: false}))   //need this to get stuff from the form, which is stored in the object body
app.engine('html', require('ejs').renderFile);
app.listen(8080)

const url = 'mongodb://localhost:27017/library';   //where mongoDB is
let database;
mongoose.connect(url, function (err) {
    if (err) {
        console.log('Error in Mongoose connection');
        throw err;
    }
    var db = mongoose.connection
    console.log('Successfully connected')});




function randomISBN() {  //ISBN has 13 digits since 2017, and consist only of numeric characters.
    return randomstring.generate({
        length: 13,
        charset: 'numeric'
    });
}

app.get('/', function (req, res) {
    res.render(__dirname + '/views/index.html', {isbnGenerated: randomISBN()})
})

app.get('/addbook', function (req, res) {
    res.render(__dirname + '/views/addBook.html', {isbnGenerated: randomISBN()})
})

app.get('/addauthor', function (req, res) {
    res.render(__dirname + '/views/addAuthor.html')
})

app.get('/getAuthors', function (req, res) {
    Author.find(function (err, data) {
        res.render(__dirname + '/views/getAllAuthors.html', {db: data})
    })
})


app.get('/getbooks', function (req, res) {
    Book.find({}).populate('author').exec(function (err, data) {
        res.render(__dirname + '/views/getBooks.html', {db: data})
    });
})

app.get('/updatebook', function (req, res) {
    res.render(__dirname + '/views/updateBook.html')
})

app.get('/deletebook', function (req, res) {
    res.render(__dirname + '/views/deleteBook.html')
})

app.get('/invalidData', function (req, res) {
    res.render(__dirname + '/views/invalidData.html')
})

app.get('/deleteauthor', function (req, res) {
    res.render(__dirname + '/views/deleteauthor.html')
})

app.get('/updateAuthorNumBooks', function (req, res) {
    res.render(__dirname + '/views/updateAuthorNumBooks.html')
})

app.get('/*', function (req, res) {
    res.render(__dirname + '/views/404 (Page not found).html')
})


app.post('/addingBook', function (req, res) {
    let TITLE = req.body.title
    let AUTHOR = mongoose.Types.ObjectId(req.body.authorID)
    let ISBN = req.body.isbn
    let DATE = new Date(req.body.date)
    let SUMMARY = req.body.summary

    let book1 = new Book({
        title: TITLE,
        author: AUTHOR,
        ISBN: ISBN,
        date: DATE,
        summary: SUMMARY
    })
    book1.save(function (err) {
        if (err) {
            throw err;
        } else {
            Author.findByIdAndUpdate(req.body.authorID, {$inc: {numBooks: 1}}, function (req, res) {
                    if (err) {
                        throw err
                    }

        })
        res.redirect('/getAuthors')}})})

    app.post('/addingAuthor', function (req, res) {
        FNAME = req.body.Fname
        LNAME = req.body.Lname
        DOB = new Date(req.body.dob)
        STATE = req.body.state
        SUBURB = req.body.suburb
        STREET = req.body.street
        UNIT = req.body.unit
        NUMBOOKS = parseInt(req.body.numBooks)

        let author1 = new Author({
            _id: new mongoose.Types.ObjectId(),
            name: {
                firstName: FNAME,
                lastName: LNAME
            },
            dob: DOB,
            address: {
                state: STATE,
                suburb: SUBURB,
                street: STREET,
                unit: UNIT
            }
            ,
            numBooks: NUMBOOKS
        })
        author1.save(function (err) {
            if (err) {
                console.log(err)
                res.redirect('/addauthor');
            } else {
                console.log('author saved')
                res.redirect('/getAuthors')
            }
        })
    })

    app.post('/deletus', function(req, res) {
        let ISBN = req.body.isbn
        Book.findOne({ISBN: ISBN}, function (err, docs) {
            tempAuthor = docs.author._id.toString()
            console.log(docs)
        })

        Book.deleteOne({ISBN: ISBN}, function (err, docs) {
            if (err){
                console.log(err)
                res.redirect('/deletebook')
            }
            Author.findByIdAndUpdate(tempAuthor, {$inc: {numBooks: -1}}, function (req, res) {
                res.redirect('/getBooks')
            })

        })
    })

    app.post('/updatingBook', function (req, res) {
        TITLE = req.body.title
        AUTHOR = req.body.author
        ISBN = req.body.isbn
        DATE = new Date(req.body.date)
        SUMMARY = req.body.summary

        if (req.body.isbn == "") {
            res.redirect('/invalidData')
        } else {
            filter = {isbn: ISBN}   //ISBN is inputted
            if (req.body.author != "") {
                database.collection('library').updateOne(filter, {$set: {author: AUTHOR}})
            }
            if (req.body.title != "") {
                database.collection('library').updateOne(filter, {$set: {title: TITLE}})
            }
            if (req.body.date != "") {
                database.collection('library').updateOne(filter, {$set: {date: DATE}})
            }
            if (req.body.summary != "") {
                database.collection('library').updateOne(filter, {$set: {summary: SUMMARY}})
            }
            res.redirect('/getbooks')
        }
    })

    app.post('/updateNumBooks', function (req, res) {
        NUMBOOKS = parseInt(req.body.numBooks)
        if (NUMBOOKS >= 1 && NUMBOOKS <= 150){
        Author.findByIdAndUpdate(req.body.authorID, {$set: {numBooks: parseInt(NUMBOOKS)}}, function (err, doc) {
            console.log(doc)
            res.redirect('/getAuthors')
        })}
        else{
            res.redirect('/updateNumBooks')
        }
    })
