# NodeJS YouTube Audio bot
***:inbox_tray: Download MP3 from YouTube on Telegram :headphones:***

## Usage
*Admin*
- Send message `...` (three dots) to get admin panel
- Use `/on` `/off` to turn the bot on and off temporary (saved in memory)
- Reply `/bc` and `/fbc` to a message to broadcast (or broadcast with forwarding it)
- Only promoted users and admins can use the bot and download files (or enable public mode so everyone can use it)
- `/delID` `/usageID` `/getID` `/promoteID` `/blockID` `/unblockID` to operate on user with id `ID`
- `/find@username` find user with username `@username`


*User*
- Send `/start` to get user panel
- Send any valid YT link or video ID to start download progress
- Each user can have only 1 download in progress
- There is queue limit for downloads at the same time (default: 2)

## Download steps
0. Send URL to bot
1. Validate and get info
2. Download video
3. Convert to MP3 and write meta data (artist, title, album)
4. Generate cover (video thumbnail) and set to MP3 file
5. Upload to Telegram
6. Delete files from server

## Launch
0. Install `npm`, `node js`, `ffmpeg`
1. Clone/Download repository
2. Open CMD/terminal and navigate to project folder
3. Run `npm install` to install dependencies
4. Change config file `config.js` content
5. Run `npm start` to start the bot

## Config help
Key | Value
------------ | -------------
`token` | Telegram bot API token
`dir` | Path to files directory. All downloads, converts and renames will occur here.<br/>**Note:** Any file in this directory will be deleted on app start. (don't change it to `./`)
`ffmpegExe` | Path to a working ffmpeg (converts MP4 to MP3).
`dataFile` | Path to a file that bot reads/writes JSON data from/to.
`maxThreads` | Maximum number of concurrent downloads. (queue limit)
`timeout` | Timeout for each step of the progress in seconds. (end-user steps, 5 steps)
`admins` | Array of chat ID. (Telegram account/chat ID - applied only on data seed)
`version` | Bot version code.

*Change required:*
+ Token
+ Path to ffmpeg exe
+ Admins (if you want to manage the bot)
