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

var globalTITLE
var globalAUTHOR
var globalSUMMARY
var globalDATE
var globalISBN

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

app.get('/', function (req, res) {      //homepage
    res.render(__dirname + '/views/index.html')
})

app.get('/addbook', function (req, res) {       //add a book (week 6)
    res.render(__dirname + '/views/addBook.html', {isbnGenerated: randomISBN()})
})

app.get('/addauthor', function (req, res) {     //add an author (week 6)
    res.render(__dirname + '/views/addAuthor.html')
})

app.get('/getAuthors', function (req, res) {    //show a table of authors(week 6)
    Author.find(function (err, data) {
        res.render(__dirname + '/views/getAllAuthors.html', {db: data})
    })
})


app.get('/getbooks', function (req, res) {  //show a table of books (week 5, updated to week 6)
    Book.find({}).populate('author').exec(function (err, data) {
        res.render(__dirname + '/views/getBooks.html', {db: data})
    });
})

app.get('/updatebook', function (req, res) {
    res.render(__dirname + '/views/updateBook.html')
})

app.get('/deletebook', function (req, res) {        //delete book by ISBN (week 5, updated to week 6)
    res.render(__dirname + '/views/deleteBook.html')
})

app.get('/invalidData', function (req, res) {       //week 5, no longer in use since invalid data is redirected back to the page
    res.render(__dirname + '/views/invalidData.html')
})


app.get('/updateAuthorNumBooks', function (req, res) {  //week 6
    res.render(__dirname + '/views/updateAuthorNumBooks.html')
})

app.get('/*', function (req, res) {     //week 5
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
        res.redirect('/getBooks')}})})

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

app.post('/updatingbook', function(req, res) {
        if ((req.body.isbn) != "") {
            isbn = parseInt(req.body.isbn)
        } else {
            res.redirect('/updatebook')
        }

        Book.findOne({ISBN: isbn}, function (err, docs) {
            console.log(docs)
            if(docs === null ){
                res.redirect('/updatebook')
            }
        else {
                if (req.body.title == "") {
                    TITLE = docs.title
                } else {
                    TITLE = req.body.title
                }
                if (req.body.authorID == "") {
                    AUTHOR = docs.author._id
                } else {
                    AUTHOR = mongoose.Types.ObjectId(req.body.authorID)
                }
                if (req.body.date == "") {
                    DATE = docs.date
                } else {
                    DATE = new Date(req.body.date)
                }
                if (req.body.summary == "") {
                    SUMMARY = docs.summary
                } else {
                    SUMMARY = req.body.summary
                }
                globalTITLE = TITLE
                globalAUTHOR = AUTHOR
                globalSUMMARY = SUMMARY
                globalDATE = DATE
                globalISBN = isbn
            }

            Book.findOneAndUpdate({ISBN: isbn}, {

                $set: {
                    title: globalTITLE,
                    author: globalAUTHOR,
                    date: globalDATE,
                    summary: globalSUMMARY
                }

            }, function (err,doc){
                if (err){
                    res.redirect('/updatebooks')
                }
                else {
                    res.redirect('/getbooks')
                }
                }

            )


        })
})




    app.post('/deletus', function(req, res) {   // Delete book by bookISBN with form data
        let ISBN = req.body.isbn
        Book.findOne({ISBN: ISBN}, function (err, docs) {
            tempAuthor = docs.author._id.toString()
            console.log(docs)
        })

        Book.deleteOne({ISBN: ISBN}, function (err, docs) {
            if (err) {
                console.log(err)
                res.redirect('/deletebook')
            }
            Author.findByIdAndUpdate(tempAuthor, {$inc: {numBooks: -1}}, function (err, doc) {
                if (err) {
                    console.log(err)
                    res.redirect('/deletebook')
                }
            })
            res.redirect('/getbooks')
        })
    })


    app.post('/updateNumBooks', function (req, res) {
        NUMBOOKS = parseInt(req.body.numBooks)
        if (NUMBOOKS >= 1 && NUMBOOKS <= 150){
        Author.findByIdAndUpdate(req.body.authorID, {$set: {numBooks: parseInt(NUMBOOKS)}}, function (err, doc) {
            if (err){
                res.redirect('/updateAuthorNumBooks')
            }
            else{
            console.log(doc)
            res.redirect('/getbooks')}
        })}

    })
