## [2.1.0-preview.1] - 2024-08-06

### Change
- Change main YT downloader dependency

### Fix
- Fix download error

## [2.0.5] - 2024-06-03

### Add
- Telegram message entity
- Read URL from message entity

### Change
- NPM audit fix; Update dependencies


## [2.0.4] - 2024-04-26

### Add
- Change language

### Change
- Bump follow-redirects from 1.15.5 to 1.15.6


## [2.0.3] - 2024-03-04

### Change
- Bump ip from 2.0.0 to 2.0.1

### Fix
- Process exit (manual shutdown)

## [2.0.2] - 2023-11-19

### Change
- Bump Sharp version
- Bump Axios version



## [2.0.1] - 2023-09-02

### Change
- Bump MongoDB version

### Fix
- Admin stats get data using Promise.all



## [2.0.0] - 2023-07-22

### Change
- User schema (add createDate)
- Update dependencies
- Update package.json (remove unnecessary dependencies)
- Broadcast stats repository (use aggregate)
- Video repository, most liked (use aggregate)
- Video repository, random (use sample)

### Fix
- YTDL core error handling
- Shutdown on tg connection timeout (fix bot unresponsive)

### Add
- Channel post type to telegram update object
- Leave chat admin command
- Leave from non whitelisted channels
- YouTube 429 error message


## [2.0.0-beta.2] - 2023-06-10

### Fix
- Read share availability from settings
- Return handler protect audio settings status

### Added
- Telegram audio file info


## [2.0.0-beta.1] - 2023-06-03

### Changed
- Rewritten in typescript (onion-based architecture)
- Data structure

### Added
- Database
- New bugs to debug in the future



## [1.2.4] - 2022-10-25

### Changed
- Replace vulnerable dependencies
- Update dependencies



## [1.2.3] - 2021-09-01

### Fix
- Cover crop bugs (float number for pixels index, no crop if file is already jpg)



## [1.2.2] - 2021-08-22

### Changed
- Crop cover if it contains same solid color in left & right (YT thumbnail)



## [1.2.1] - 2021-08-20

### Added
- Add options in admin settings panel

### Fix
- Fix /cancel feature
- Fix bugs (timeout and delete files)



## [1.2.0] - 2021-08-18

### Changed
- Improvements (back-end), add config file, remove dead code
- Full English



## [1.1.5] - 2021-07-09

### Added
- Share feature



## [1.1.4] - 2021-07-07

### Changed
- Minor improvements



## [1.1.3] - 2021-06-24
 
### Added
- Recent downloads
- Unlike

### Fix
- Video convert error



## [1.1.2] - 2021-06-23
 
### Added
- Like feature
- Most likes


## [1.1.1] - 2021-06-21
   
### Changed
- Admin stats improvement (added more info log)
 
### Fixed
- Title contains non standard characters


## [1.1.0] - 2021-06-20
 
### Added
- New features: random, top and week top songs


## [1.0.1] - 2021-06-18
 
### Added
- Remove artist name from title if it exists (prevent duplicate)
 
### Fixed
 
- Cut long song titles