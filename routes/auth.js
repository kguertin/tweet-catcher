const router = require('express').Router();
const passport = require('passport');



router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

router.get('/login/twitter',
  passport.authenticate('twitter'));

router.get('/login/twitter/return', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/')
  });

module.exports = router;