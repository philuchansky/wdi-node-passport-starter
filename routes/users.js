const
  express = require('express'),
  usersRouter = new express.Router(),
  passport = require('passport')

// render login view
usersRouter.get('/login', (req, res) => {
  res.render('login')
})

// render signup view
usersRouter.get('/signup', (req, res) => {
  res.render('signup')
})

module.exports = usersRouter