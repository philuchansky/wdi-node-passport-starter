const
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('../models/User.js')

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, thatUser) => {
    done(err, thatUser)
  })
})

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  User.findOne({ email: email }, (err, user) => {
    if(err) return done(err)
    if(user) return done(null, false, req.flash('signupMessage', "email already exists"))
    
    if(!req.body.name || !req.body.password) return done(null, false, req.flash('signupMessage', "All fields are required..."))
    
    var newUser = new User()
    newUser.name = req.body.name
    newUser.email = req.body.email
    newUser.password = newUser.generateHash(req.body.password)
    newUser.save((err, savedUser) => {
      return done(null, newUser)
    })
  })
}))

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  User.findOne({ email: email }, (err, user) => {
    if(err) return done(err)
    if(!user) return done(null, false, req.flash('loginMessage', "Invalid credentials."))
    if(!user.validPassword(req.body.password)) return done(null, false, req.flash('loginMessage', "Invalid credentials."))

    // add a welcome flash message, and display it on the profile page:
    return done(null, user)
  })
}))

module.exports = passport