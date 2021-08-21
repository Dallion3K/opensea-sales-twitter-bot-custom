require('dotenv').config();
const axios = require('axios');
const twit = require('twit');
const fs = require('fs');
const _ = require('lodash');
const TenMinutes = 10*60*1000;


//Keys loaded from .env
const twitConfig = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 30*1000 //30 seconds before giving up on a search
};

//Twitter Client.
const twitClient = new twit(twitConfig);
///Data structure
// let twitterData = 
// {
//    asset_list:[],
//    tree_count: 0,
//    plot_count: 0,
//    other_asset: false,
//    total_price:0,
//    payment_token:null
//    transaction
// }

async function CheckDuplicateThenTweet(assetsData){


    let query = GetSearchQuery(assetsData);

    let searchParams = {
        q:query,
        count: 1,
        result_type: "recent"
    }

    twitClient.get('search/tweets',searchParams,(error, data, response)=>{

        if (error) LogError(error); //Error
        else //Success
        {
            const statuses = _.get(data, 'statuses');

            if (_.isEmpty(data)||_.isEmpty(statuses)) //No tweet found matching params.
            {
                console.log('No recent tweet matching params found, commencing tweet.');
                let tweetText = GetTweetFromAssets(assetsData);

                return SendTweet(tweetText,assetsData.main_asset.image_url);
            }
            else{

                console.error('Tweet is a duplicate; possible delayed transaction retrieved from OpenSea');

            }
        }

    });
}

async function SendTweet(text, imageurl){
    const image = await (getBase64(imageurl));    // Format our image to base64
    
    console.log(text);
    //TODO: TEST CODE FOR TWEETS AFTER TESTING FORMATTING
    //Upload image, if image successfully uploaded, send tweet. 
    twitClient.post(
        'media/upload',
        {media_data:image},
        (error, media, response)=>{
            if (error) LogError(errorMessage); //Error
            else//Success
            {
                const tweetData = { //Set text and image uploaded.
                    status: text,
                    media_ids: [media.media_id_string]
                };

                twitClient.post(
                    'statuses/update',
                    tweetData,
                    (error,tweet,response)=>{
                        if (error)LogError(error);//Error
                        else//Success
                        {
                            console.log(`----| Tweet sent. |----`);
                        }
                    }
                );
            }
        }
    );
}

//Format tweet from asset data.
function GetTweetFromAssets(assets){
    const firstAsset = assets.main_asset;
    const openseaLink = (assets.permalink)?assets.permalink:`https://opensea.io/assets/${firstAsset.asset_contract.address}/${firstAsset.token_id}`;
    const treeCount = assets.tree_count;
    const plotCount = assets.plot_count;
    const cryptoPrice  = (assets.total_price/1000000000000000000).toFixed(2);
    const usdPrice = ((assets.total_price/1000000000000000000) * assets.payment_token.usd_price).toFixed(2);
    const symbol = (assets.payment_token.symbol=='WETH'||assets.payment_token.symbol=='ETH')?'Ξ':assets.payment_token.symbol;

    const buyerAddy = GetNameOrAddy(assets.buyer);
    const sellerAddy = GetNameOrAddy(assets.seller);

    let tweetText = ``;


    if (assets.other_asset) //Its a bundle.
    {
        if (treeCount > 0)  //Append tree count if tree(s).
        {
            tweetText+=`${treeCount} Tree`
            
            if (treeCount > 1) //Pluralise
                tweetText+="s"
            
            if (plotCount > 0)  //Ampersand to include both.
                tweetText += " & ";
        }

        if (plotCount > 0) //Append plot count if plot(s).
        {
            tweetText+=`${plotCount} Founder's Private Plot`
            
            if (plotCount > 1) //Pluralise
                tweetText+="s"
            
        }

        tweetText += ` were purchased in a bundle`

    }
    else //Not a bundle, just the one asset.
    {
        tweetText += `${firstAsset.name} was purchased`; //Use the token name.
    }

    //Add pricing, addresses, and link.
    tweetText += ` for ${cryptoPrice}${symbol} ($${usdPrice}) by ${buyerAddy} from ${sellerAddy} #treeverse #ethereum ${openseaLink}`;

    return tweetText;
}
//Get search string from data.
function GetSearchQuery(assets){
    const symbol = (assets.payment_token.symbol=='WETH'||assets.payment_token.symbol=='ETH')?'Ξ':assets.payment_token.symbol;
    const openseaLink = (assets.permalink)?assets.permalink:`https://opensea.io/assets/${assets.main_asset.asset_contract.address}/${assets.main_asset.token_id}`;

    const cryptoPrice  = (assets.total_price/1000000000000000000).toFixed(2);
    const buyerAddy = GetNameOrAddy(assets.buyer);
    const sellerAddy = GetNameOrAddy(assets.seller);

    var component_price = encodeURIComponent(`"purchased for ${cryptoPrice}${symbol}"`);
    var component_accounts = encodeURIComponent(`"by ${buyerAddy} from ${sellerAddy}"`);
    var component_url = (`url:${assets.main_asset.token_id} OR url:"${assets.permalink}"`);
    return component_price+"%20"+component_accounts+"%20"+component_url;
}
//Get account name or short addy.
function GetNameOrAddy(acc){
    //Name check.
    if (acc.user != null) 
    {
        if (acc.user.username)
            if (acc.user.username.length <= 8){
                return acc.user.username;
            }
    }
    //Otherwise short address.
    return acc.address.substring(0,8);
}

// Format a provided URL into it's base64 representation (Get the image to attach to the tweet.)
function getBase64(url) {
    return axios.get(url, { responseType: 'arraybuffer'}).then(response => Buffer.from(response.data, 'binary').toString('base64'))
}

function LogError(errorMessage){

    var date = Date.now().toString().substring(0,6);

    fs.appendFile(
        "logs/"+date+".txt",
        `Time: ${Date.now()}\nMessage:${errorMessage}\n\n`,
        (err)=>{if (!err)console.log("Error written to log.");else console.log(`Error writing log. ${err}`);}
    )
}

module.exports = {
    CheckDuplicateThenTweet, LogError
}