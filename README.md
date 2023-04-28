# NodeJS YouTube Audio bot <sup>v2</sup>
***:inbox_tray: Download MP3 from YouTube on Telegram :headphones:***

## Steps
🔁 Validate  
ℹ️ Get info  
📥 Download video  
🎙 Convert to MP3  
📸 Generate cover (video thumbnail) and set to MP3 file  
🖋 Write meta data (artist, title, album)  
📤 Upload to Telegram  

## Launch
1. Clone/Download repository
2. Open CMD/terminal and navigate to project folder
3. Run `npm i --omit=dev` to install dependencies (or just `npm i` for development)
4. Create environment file `.env` using `.env.example`
5. Run `npm run start` to start the bot

### Requirements
- NodeJS v16+
- FFMPEG ([official download page](https://ffmpeg.org/download.html))
- MongoDB

## Config help (.env)
Key | Value
------------ | -------------
`YTA_TG_TOKEN` | Telegram bot API token
`YTA_TG_OWNERS` | Array of chat ID (Telegram account/chat ID)
`YTA_FFMPEG_EXE` | Path to a working ffmpeg binary (converts MP4 to MP3)
`YTA_MONGODB` | MongoDB connection string
`YTA_USER_CONCURRENT_DOWNLOADS` | Maximum number of concurrent downloads per user
`YTA_TOTAL_CONCURRENT_DOWNLOADS` | Maximum number of concurrent downloads (queue limit)
`YTA_STEP_TIMEOUT` | Timeout for each step of the progress in seconds (end-user steps, 6 steps)
