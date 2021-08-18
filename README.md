# :sparkler: YouTube Audio bot :fire:
***:inbox_tray: Download MP3 from YouTube on Telegram :headphones:***

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
4. Change config file `config.js` content (bot token, download directory, ffmpeg and ...)
5. Run `npm start` to start the bot



## Usage
*Admin*
- Send message `...` (yes, three dots) to get admin panel
- Use `/on` `/off` to turn the bot on and off temporary (saved in memory)
- Reply `/bc` and `/fbc` to a message to broadcast (or broadcast with forwarding it)
- You should promote a user so he can use the bot and download files (due to copyright issues)
- `/delID` `/usageID` `/getID` `/promoteID` `/blockID` `/unblockID` to operate on user with id `ID`
- `/find@username` find user with username `@username`


*User*
- Send `/start` to get user panel
- Send any valid YT link or video ID to start download progress (you should be an admin or promoted)
- You can have only 1 download in progress
- There is queue limit for downloads at the same time (default: 2)


## To-Do
- [x] Create config file
- [x] Create npm package
- [x] Translate all strings to English
- [x] Remove dead code
- [ ] Complete GitHub README
- [ ] Fix timeout bug (should cancel operation)
- [ ] Fix `/cancel` feature