# Opensea Sales Twitter Bot

Based off [dsgriffin's twitter bot](https://github.com/dsgriffin/opensea-sales-twitter-bot), this bot uses opensea's latest RESTful v1.0 API.

## Donations

If you find this script/repo useful for your project, any ETH/token donations are appreciated.
Ethereum Address: 0xD6215aA5266880aF67a883512d026bbe4d7467c9

Or donate to [dsgriffin's twitter bot](https://github.com/dsgriffin/opensea-sales-twitter-bot) as the inspiration for this bot.


## Requirements

- [Twitter Developer Account](https://developer.twitter.com/en/apply-for-access)

## Setup

Once you have been granted access to a Twitter Developer Account, created a project there, create a .env file in the root of the project.

- Clone/Fork/Copy this project to your local public/private git repo
&nbsp;-Create a .env file in the root of the project with:
&nbsp;-**ACCESS_TOKEN_KEY** - The Access Token Key of the Twitter Account your bot is posting from
&nbsp;-**ACCESS_TOKEN_SECRET** - The Access Token Secret of the Twitter Account your bot is posting from
&nbsp;-**CONSUMER_KEY** - Your Twitter App's Consumer Key
&nbsp;-**CONSUMER_SECRET** - Your Twitter App's Consumer Secret
&nbsp;--**SLUGS** - The OpenSea collection name(s) you wish to track (e.g. `lost-relics`). You can use multiple slugs by making a comma delimited list (e.g.: 'lost-relics,age-of-rust').

I use a Virtual Private Server (VPS) with Ubuntu Server LTS installed. If you know how to personally host node applications, great! Otherwise checkout [dsgriffin's twitter bot](https://github.com/dsgriffin/opensea-sales-twitter-bot) for the Heroku method.

## Tweet Content

By default the bot will include pure bundles (bundles where all items are a part of the same project/slug) and individual sales.

## Useful Resources

If you are having trouble setting up your Twitter Developer project, Heroku project etc. the following resources may be of use

- [Heroku - Deploying with Git](https://devcenter.heroku.com/articles/git)
- [Twurl - Generate Access Token Key/Secret Locally](https://github.com/twitter/twurl)
- [OpenSea Events API](https://docs.opensea.io/reference/retrieving-asset-events)

## License

This code is licensed under the [ISC License](https://choosealicense.com/licenses/isc/).

Please include proper attribution if you fork or modify this project in some way. Thank you!
