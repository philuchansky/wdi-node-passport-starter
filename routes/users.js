const
  express = require('express'),
  usersRouter = new express.Router(),
  passport = require('passport')

usersRouter.get('/login', (req, res) => {
  res.render('login')
})

usersRouter.get('/signup', (req, res) => {
  res.render('signup')
})

module.exports = usersRouter