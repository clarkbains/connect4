# `Connect4`

This project has balooned a little bit. It currently involves the following:
- CD System. (If you can't get it to build, as a backup, you can see the master version [here](https://78y43y3ghfo7tyfgh43o74fye7w87fghw7fy.2406.clarkbains.com/). Its quite possible there are things in it that are currently incompatable with windows machines.)
- Typescript API
- Mostly functional custom built ORM
- SQLite3 DB
- Aurelia Frontend
- Docker support


## Files
This project needs a bit of refactoring, but as it stands, here are all of the key folders and files.
- auto-updater (CI Code)
- connect4 (Application Code):
    - src (Source Code):
        - ui:
            - views (html templates)
            - static (front end assets. May be moved in part into backend later)
            - app.js (front end routes)

        - api:
            - main.ts (enterance point. Mounts all the routes recursively)
            - routes (holds the actual API. The api mirrors the folder structure here. ie the express 'login' path in routes/public/user is mounted at /api/public/user/login)
            - models/models.ts (Holds an extensive collection of back end models, for DB, for front end requests, and front end responses.)
            - resources (Holds some fun code for the API):
                - databaseHelpers.ts (An orm I built for this project. Dynamically generates sql for the models that extend this class.)
                - APIHelpers.ts wrappers for express callbacks. Handles all the stuff I don't want to handle in every response, like errors.
                - APIStatus.ts holds responses from the api. I'm on the fence about this, I don't know if I want to wrap all, some, or none of the returned API data with info text. 
    - dist (Transpiled Code):
        - ui
        - api
An alternate list of files can be found in `./files.txt`

## Notes
- The API also serves the static site files. You do not need to run your own local web server.
- The Actual connect 4 game is useless right now. Clicking on a canvas will colour the circle green. This is demoing a server side response. I still have to do server side game logic. (Also piece placement will be offset if you scroll down on the page, click detection is absolute, not relative.)
- I Will eventually be pulling out bootstrap cards into their own view. This was just for a quick mock up

## Downloading Dependencies
`npm install`


## Building/Running
There are several different build options. Some will also run, some will require other steps to run.
### Docker
Honestly have never tried docker on windows. The npm docker deployment *will* fail, since it calls a shell script in [the auto updater](./auto-updater). Best of luck with the other methods. Runs server on [port 9000](http://localhost:9000)
#### npm
`npm run deploy:docker`
#### docker-compose
`docker-compose up --no-deps --build`
add the `-d` flag to start it in the background
#### plain docker
I mean I have a dockerfile, so you don't need to user `docker-compose`, but just use it, there's no reason not to.

### Local
Runs server on [port 9000](http://localhost:9000)
#### Compiled Build
This will generate the dist files for both the api and ui `npm run build`. Running the built API can be done with `npm run deploy:local`
#### Watch Mode Build
`npm run start`
This will watch the files, and start a server for them. Easiest to set up, however webpack occasionally deletes the built UI files, so if you see a JSON not found response from the server, just restart the command. It tends to only happen when changing files though.

## CI/CD
There is an included auto-updater script to do CD. Using `pm2` or some other process manager, create the `auth.js` file within the auto-updater dir, and run it with `pm2 start Connect4CIService.js`.  It will listen on port `7324`, and will use the discord info to send updates to a channel of your choice.