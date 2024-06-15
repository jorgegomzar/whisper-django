- VTT content should be stored in DB to not re-read the file every time the user loads the page

- Add button on transcript lines to go to video instants
    - Need to dockerize the repo + add nginx to properly set the header for the video to work
    https://stackoverflow.com/questions/36783521/why-does-setting-currenttime-of-html5-video-element-reset-time-in-chrome

- Allow user to add comment on each line + show in reports

- GitHub actions to build and deploy commits to master

- Allow users to work on an existing AV + json
    - Generate uid from media upload
    - URLs should use said uid instead of DB row.id
    - JSON should now include the uid
    - Move JSON import button to root page
    - Import should now get info from DB
