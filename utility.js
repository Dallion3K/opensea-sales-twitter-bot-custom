require('dotenv').config();
const axios = require('axios');
const twit = require('twit');
const fs = require('fs');
const _ = require('lodash');
const { createNamedStub } = require('graphql-tools');

///Data structure
// let twitterData = 
// {
//    asset_list:[],
//    tree_count: 0,
//    plot_count: 0,
//    other_asset: false,
//    transaction:null
// }


//Keys loaded from .env
const twitConfig = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

//Twitter Client.
const twitClient = new twit(twitConfig);

async function CheckDuplicateThenTweet(assetsData){

    let query = "Coke+Pepsi"; //TODO: Search string.

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

                return SendTweet(assetsData);
            }
            else{
                
                console.error('Tweet is a duplicate; possible delayed transaction retrieved from OpenSea');
                console.log(data);
                console.log(statuses);
            }
        }

    });
}

async function SendTweet(assets){
    const image = await (getBase64(assets.asset_list[0].image));    // Format our image to base64
    
    let tweetText = GetTweetFromAssets(assets);

    console.log(tweetText);
    return;

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
                    status: tweetText,
                    media_ids: [media.media_id_string]
                };

                twitClient.post(
                    'statuses/update',
                    tweetData,
                    (error,tweet,response)=>{
                        if (error)LogError(error);//Error
                        else//Success
                        {
                            console.log(`Tweet sent: ${tweetText}`);
                        }
                    }
                );
            }
        }
    );
}

//Format tweet from asset data.
function GetTweetFromAssets(assets){
    const firstAsset = assets.asset_list[0];
    const openseaLink = `https://opensea.io/assets/${firstAsset.asset_contract.address}/${firstAsset.token_id}`;
    const treeCount = assets.tree_count;
    const plotCount = assets.plot_count;
    const cryptoPrice  = (assets.total_price/1000000000000000000).toFixed(2);
    const usdPrice = ((assets.total_price/1000000000000000000) * assets.payment_token.usd_price).toFixed(2);
    const symbol = (assets.payment_token.symbol=='WETH'||assets.payment_token.symbol=='ETH')?'Ξ':assets.payment_token.symbol;

    const buyerAddy = GetNameOrAddy(firstAsset.winner_account);
    const sellerAddy = GetNameOrAddy(firstAsset.seller);

    let tweetText = ``;

    if (assets.asset_list > 1 || assets.other_assets) //Its a bundle.
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
            tweetText+=`${plotCount} Plot`
            
            if (plotCount > 1) //Pluralise
                tweetText+="s"
            
        }

        tweetText += ` were purchased in a bundle`

    }
    else //Not a bundle, just the one asset.
    {
        tweetText += `${firstAsset.tokenName} was purchased `; //Use the token name.
    }

    //Add pricing, addresses, and link.
    tweetText += `for ${cryptoPrice}${symbol} ($${usdPrice}) by ${buyerAddy} from ${sellerAddy} #treeverse #ethereum ${openseaLink}`;

    return tweetText;
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