# Opensea Sales Twitter Bot

## Requirements

- [Twitter Developer Account](https://developer.twitter.com/en/apply-for-access)

## Setup

Once you have been granted access to a Twitter Developer Account, created a project there, create a .env file in the root of the project.

- Clone/Fork/Copy this project to your local public/private git repo 

- Create a .env file in the root of the project with:

&nbsp;**ACCESS_TOKEN_KEY** - The Access Token Key of the Twitter Account your bot is posting from

&nbsp;**ACCESS_TOKEN_SECRET** - The Access Token Secret of the Twitter Account your bot is posting from

&nbsp;**CONSUMER_KEY** - Your Twitter App's Consumer Key

&nbsp;**CONSUMER_SECRET** - Your Twitter App's Consumer Secret

&nbsp;**SLUGS** - The OpenSea collection name(s) you wish to track (e.g. `lost-relics`). You can use multiple slugs by making a comma delimited list (e.g.: 'lost-relics,age-of-rust').

I used a Virtual Private Server (VPS) with Ubuntu Server LTS installed. If you know how to personally host node applications, great! Otherwise checkout [dsgriffin's twitter bot](https://github.com/dsgriffin/opensea-sales-twitter-bot) for the Heroku method.

## Tweet Content

By default the bot will include pure bundles (bundles where all items are a part of the same project/slug) and individual sales.
