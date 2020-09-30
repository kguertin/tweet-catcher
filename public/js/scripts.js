    tweetIds = tweetIds.split(',');
    console.log(tweetIds)

    localStorage.setItem('tweets', JSON.stringify(tweetIds))

    window.onload = (() => {

        const tweets = document.querySelectorAll(".tweet");
        tweets.forEach(tweet => {
            const id = tweet.getAttribute("tweetID");
    
            twttr.widgets.createTweet(
            id, tweet,
            {
                conversation : 'none',    // or all
                cards        : 'hidden',  // or visible
                linkColor    : '#cc0000', // default is blue
                theme        : 'light'    // or dark
            })
        })
    });

//load more tweets

const loadBtn = document.querySelector('#load-tweets-btn');

loadBtn.addEventListener('click', async e => {
    e.preventDefault();

    const tweetData = JSON.parse(localStorage.getItem('tweets'));
    const currentTweets = document.querySelector('#tweet-container').children.length;
    console.log(currentTweets)
    
    const tweetsToAdd = tweetData.slice(currentTweets, currentTweets + 6);

    tweetsToAdd.forEach(tweet => {
        const component = 
        `<div class="col">
        <div class="tweet-card">
            <div class="select-section">
                <div class="tweetCheckBox">
                    <div class="form-check form-check-inline">
                        <input class="form-check-inputb select-tweet" type="checkbox" value="<%= tweet %>">
                        <label class="form-check-label select-all-label" for="inlineCheckbox1">Select</label>
                      </div>
                </div>
            </div>
            <div class="tweet" tweetID="${tweet}"></div>
            <div class="categories"></div>
        </div>
    </div>`
    document.querySelector('#tweet-container').insertAdjacentHTML('beforeend', component);
})

tweetsToAdd.forEach(tweet => {
    const newTweet = document.querySelector(`[tweetId="${tweet}"]`);
    console.log(newTweet);
    const id = newTweet.getAttribute("tweetID");
    
        twttr.widgets.createTweet(
        id, newTweet,
        {
            conversation : 'none',    // or all
            cards        : 'hidden',  // or visible
            linkColor    : '#cc0000', // default is blue
            theme        : 'light'    // or dark
        })

    })

})

//Select all tweets

const selectAllTweets = document.querySelector('#select-all-tweets');
selectAllTweets.addEventListener('click', e => {
   if(e.target.checked){
        document.querySelectorAll('.select-tweet').forEach(box => {
            box.checked = true
        })
   } else {
    document.querySelectorAll('.select-tweet').forEach(box => {
        box.checked = false
    })
   }
})


// Add Category

const AddCategoryBtn = document.querySelector('#add-category-btn')
if(AddCategoryBtn){
AddCategoryBtn.addEventListener('click', () => {
    const category = document.querySelector('#add-category-value').value;
    
    const selectedTweets = [];
    const checkBoxes = document.querySelectorAll(".select-tweet");
    checkBoxes.forEach(box => {
        if(box.checked){
            selectedTweets.push(box.value);
        }
    })

    fetch('/addCategory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tweets: selectedTweets,
            category: category
        })
    })
    .then(res => {
        const div = document.getElementById('success-msg')
        div.classList.remove('hide')
        setTimeout(() => {
            console.log('yes')
            div.classList.add('hide')
        }, 3000)
    })
    .catch(err => console.log(err))
})
}

// Remove Category

const removeBtn = document.querySelector('.btn-remove-tweet')
if(removeBtn){
    removeBtn.addEventListener('click', () => {
        const category = document.getElementById('category').value;
        const selectedTweets = [];
        const checkBoxes = document.querySelectorAll(".select-tweet");
        checkBoxes.forEach(box => {
            if(box.checked){
                selectedTweets.push(box.value);
            }
        })
    
        fetch('/removeTweet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tweets: selectedTweets,
                category: category
            })
        })
        .catch(err => console.log(err))
        selectedTweets.forEach(tweet => {
            document.getElementById(tweet).remove();
        })
    })
}