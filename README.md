# slackfd
Deletes files from slack. Great for free accounts.

#### What this tool does
Slack does not have a bulk delete tool. This tool iterates through all files and deletes them (if they are not pinned).
This is great for free teams, because eventually every file you upload will result in a message like this:  
`Your file was uploaded — it’s safe and sound in Slack. Unfortunately your team doesn’t have any storage space left. To get more space, you can upgrade to a paid account or delete some of your older files.`  
Pretty annoying.

In order for this tool to work, you must have a legacy API token for that user. API tokens can be obtained here: https://api.slack.com/custom-integrations/legacy-tokens

Once obtained, these parameters should be set as environment variables (via [dotenv](https://github.com/motdotla/dotenv)) and the app can be run as:
`$ node app.js`

#### NOTES:
* Slack has a very short API rate limit. In order to not be rate limited (and your token possibly banned), this tool deletes 1 file per ~1 second. It's unfortunate, but the deletion rate can easiliy be modified if you think you can do better. I would suggest running this tool overnight for lengthly channels.
