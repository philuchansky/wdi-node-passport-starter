const
	express = require('express'),
	app = express(),
	ejsLayouts = require('express-ejs-layouts'),
	mongoose = require('mongoose'),
	flash = require('connect-flash'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	MongoDBStore = require('connect-mongodb-session')(session),
	passport = require('passport'),
	passportConfig = require('./config/passport.js'),
	usersRouter = require('./routes/users.js'),
	Tweet = require('./models/Tweet.js')

// environment port
const
	port = process.env.PORT || 3000,
	mongoConnectionString = process.env.MONGODB_URL || 'mongodb://localhost/passport-authentication'

// mongoose connection
mongoose.connect(mongoConnectionString, (err) => {
	console.log(err || "Connected to MongoDB (passport-authentication)")
})

// will store session information as a 'sessions' collection in Mongo
const store = new MongoDBStore({
  uri: mongoConnectionString,
  collection: 'sessions'
});

// middleware
app.use(logger('dev'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(flash())

// ejs configuration
app.set('view engine', 'ejs')
app.use(ejsLayouts)
app.use(session({
	secret: "boooooooooom",
	cookie: { maxAge: 60000000 },
	resave: true,
	saveUninitialized: false,
	store: store
}))

app.use(passport.initialize())
app.use(passport.session())

// this makes the 'currentUser' available in ANY view
// also gives me a boolean 'loggedIn' available in ANY view
app.use((req, res, next) => {
	app.locals.currentUser = req.user
	app.locals.loggedIn = !!req.user
	next()
})

//root route
app.get('/', (req,res) => {
	console.log(req.user)
	res.render('index')
})

app.use('/users', usersRouter)

// Tweet Routes (should be moved to separate file)

// this middleware function redirects a user to login if they aren't logged in. Declaring the function is step 1. Step 2 is 'using' this function on one or more routes. See below comment.
function authorization(req, res, next) {
	if(req.isAuthenticated()) return next()
	res.redirect('/users/login')
}

// if the following line were uncommented, ALL subsequent routes would require a user to be logged in. To see an example of protecting just one route, see line 96:
// app.use(authorization)

app.get('/tweets', (req, res) => {
	Tweet.find({}).populate('user').exec((err, allTweets) => {
		res.render('tweets/index', { tweets: allTweets })
	})
})

// associating a new tweet to the current user is easy, simply add the current user (req.user) as the tweet's user property before saving the tweet.
app.post('/tweets', (req, res) => {
	var newTweet = new Tweet(req.body)
	newTweet.user = req.user._id
	newTweet.save((err, brandNewTweet) => {
		res.redirect('/tweets')
	})
})

// inserting the authorization middleware as the second argument for a route declaration, like below, applies that middleware to JUST that one route:
app.get('/tweets/new', authorization, (req, res) => {
	res.render('tweets/new')
})

app.listen(port, (err) => {
	console.log(err || "Server running on port " + port)
})
