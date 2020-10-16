require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const Strategy = require('passport-twitter').Strategy;
const app = express();
const bodyParser = require('body-parser');


const User = require('./models/user')

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user')

const PORT = process.env.PORT || 3000;
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0-kmmuu.mongodb.net/twitter-api`;

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

passport.use(new Strategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_API_SECRET,
    callbackURL: 'http://127.0.0.1:5000/login/twitter/return'
    },
    function(token, tokenSecret, profile, cb) {
      return cb(null, profile);
    }));

  passport.serializeUser(function(user, cb) {
    cb(null, user);
  });
  
  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret:'secret',
    resave: true, 
    saveUninitialized: true,
    store: store
}))

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(passport.initialize())
app.use(passport.session())

app.use(authRoutes);
app.use(userRoutes)

app.get('/', (req, res) => {
  if(req.user){
    const {username, id} = req.user
    User.findOne({twitterId: id})
      .then(user => {
        if(!user) {
          const newUser = new User({
            username: username,
            twitterId: id
          })
          newUser.save();
        }
      })
      .catch(err => console.log(err))
      req.session.isLoggedIn = true
      req.session.save(); 
    }
    res.render('index', {
      user: req.user,
      pageTitle: 'Home',
      isLoggedIn: req.session.isLoggedIn
    })
})

mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`app listening on port ${PORT}`)
    })
  })
  .catch(err => console.log(err));


// style categories page
// add loading image
// fix column sizes
// backend validation
// flash messages


  // create ability to add hashtags, and check for later
