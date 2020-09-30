require('dotenv').config();
const Twit = require('twit');
const User = require('../models/user');
const user = require('../models/user');

const T = new Twit({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret:process.env.TWITTER_API_SECRET,
    app_only_auth: true
})

exports.getSearchData = (req, res) => {
    let tweetData;
    let {hashtags} = req.body;
    hashtags = hashtags.split(',').slice(0,5);

    let queryString = '';
    hashtags.forEach((tag, index) => {
        const currentTag = tag.trim()
        if(hashtags.length === 1 || index + 1 === hashtags.length){
            queryString += `%23${currentTag}`
        } else {
            queryString += `%23${currentTag}%2bOR%2b`
        }
    })

    let tweetIDs = []
    
    T.get('/search/tweets', {q: queryString, count: 100})    
        .then(res => {
            console.log(res.data.statuses)
            res.data.statuses.forEach(tweet => {
                tweetIDs.push(tweet.id_str)
            });
        })
        .then(() => {
            res.status(200).render('viewTweets', {
                pageTitle: 'Search Results',
                isLoggedIn: req.session.isLoggedIn,
                tweetIDs: tweetIDs,
                initialTweets: tweetIDs.slice(0, 12)
            })
        })
        .catch(err => console.log(err))
    }

    exports.loadTweets = (req, res) => {
        console.log('route hit')
        res.status(200).json({great: 'success'});
    }

    exports.postCategory = async (req, res) => {
        try {
            let categoryExists;
            const { tweets, category } = req.body;

            if(category === '') return res.json({msg: 'Please enter a category'})
            
            const currentUser = await User.findOne({twitterId: req.user.id});
            const currentCategories = currentUser.categories;
            currentCategories.forEach(cat => {
                if(cat.name === category){
                    categoryExists = true;
                    console.log('here')
                    const tweetsToAdd = tweets.filter(tweet => !cat.tweetIds.includes(tweet));
                    return cat.tweetIds = [...cat.tweetIds, ...tweetsToAdd];
                }
            })
            if(!categoryExists){
                currentCategories.push({name: category, tweetIds: [...tweets]});
            }
            currentUser.categories = currentCategories;
            
            currentUser.save();

            res.status(200).json({msg: 'success'});
        } catch (err){
            console.log(err)
        }
    }

    exports.getCategories = (req, res) => {
        console.log(req.user.id);

        User.findOne({twitterId: req.user.id})
            .then(user => {
                const categories = user.categories
               return res.render('categories', {
                            pageTitle: 'Search Results',
                            isLoggedIn: req.session.isLoggedIn,
                            categories
                        })
            })
            .catch(err => console.log(err))

    }

    exports.getCategory = async (req, res) => {
        try {
            const categoryName = req.params.name;
            const user = await User.findOne({twitterId: req.user.id});
            let categoryData;
            user.categories.forEach(category => {
                if(category.name === categoryName){
                    categoryData = category;
                }
            })
            console.log(categoryData);
            res.status(200).render('category', {
                pageTitle: categoryData.name,
                tweetIDs: categoryData.tweetIds,
                initialTweets: categoryData.tweetIds.slice(0, 12),
                isLoggedIn: req.session.isLoggedIn
            })
        } catch (err) {
            console.log(err)
        }
    }

    exports.removeTweet = async (req, res) => {
        try {

        const {category, tweets } = req.body;
        const user = await User.findOne({twitterId: req.user.id});
        let newTweets = [];

        user.categories.forEach(cat => {
            if(cat.name === category){
                cat.tweetIds.forEach(tweet => {
                    if(!tweets.includes(tweet)) newTweets.push(tweet)
                })
                cat.tweetIds = newTweets;
            }
        })
        if(newTweets.length=== 0){
            const newCategories = user.categories.filter(cat => cat.name !== category)
            user.categories = newCategories
        }
        user.save();
    } catch(err) {
        console.log(err)
    }
    }

