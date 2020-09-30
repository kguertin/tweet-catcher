const router = require('express').Router()
const userController = require('../controllers/user');
const isAuth = require('../middlewear/is-auth');

router.post('/search', isAuth, userController.getSearchData);

router.get('/loadTweets', userController.loadTweets);

router.post('/addCategory', isAuth, userController.postCategory);

router.get('/categories', isAuth, userController.getCategories)

router.get('/category/:name', userController.getCategory)

router.post('/removeTweet', isAuth, userController.removeTweet)

module.exports = router