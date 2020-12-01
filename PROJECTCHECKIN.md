# Project Check in 3

Clark Bains

101149052

Connect4


## Testing Code
This code runs in several different environments. Here are instructions to view it in a variety of these environments
### Locally
#### Installing Dependencies
- Run `npm install` to install all dependencies
#### Building
- Run `npm run build`. This will compile all the typescript and webpack the front end. Built files are placed in connect4/dist
### Running
- Run `npm run deploy:local` Visit the running server at http://localhost:9000
### Troubleshooting
 - The build step doesn't do anything? Sometimes it hangs for a while. Restart it a few times and be patient, or use the command `npm run start` in place of the commands for building and running. This command has some of its own issues, but is generally much quicker.   This starts a progressive "watch mode" build on both the api and ui, and updates the server on any changes.
 - If `npm run start` does not work immediately, and you are doing a fresh build, ie connect4/dist is empty, Run the command and wait for the connect4/dist ui and api folders to appear, and then kill and restart the command. This is caused because the command to run the server fails since the server has not been compiled yet.
 - If neither of these work, there are the cloud builds available. I have validated that both of them work.
### Cloud

#### Openstack
- The code should be running on openstack. It runs under a dockerized environment. 
- Connect to the VPN/use access.scs.carleton.ca as a jump host, and then log into my openstack instance, `ssh student@134.117.131.57` with password `crackThisJohn`
- I have generally left my application running, you can check if it is currently running with `docker ps | grep connect4`. No output means it is not running. 
- If it isn't running, navigate to the repository with `cd connect4`, and run it in with `docker-compose up -d`. For you convenience, and because it takes several minutes to build on openstack, I will have prebuilt the image for you with `docker-compose build --parallel --no-cache`. 
- The docker service binds to port 3000 on the openstack instance, so to view it, you will have to port tunnel this with the following command `ssh -L 9000:localhost:3000 student@134.117.131.57`. After that, you will be able to see the built instance at http://localhost:9000.
- To kill the service, navigate to the connect4 folder and run `docker-compose kill -f && docker-compose rm -f` on the openstack instance.
- To view logs of the system, navigate to `~/connect4` and run `docker-compose logs`

#### CD System
- I have set up a CD system, which means that you can visit [here](https://78y43y3ghfo7tyfgh43o74fye7w87fghw7fy.2406.clarkbains.com/) to see the latest version of the code, built and deployed on my own server.
- Setup for this is lengthy/complicated and instructions are not provided. 

### Important Notes
- The navbar will not work in the collapsed state, please maximize the window to view all the options.

### Seeded Data
I have included the same database in my submission as in both the openstack and CI system on my server. This means you should be able to use the same credentials no matter which platform you chose to evaluate using.
- Users
    - `username` / `username11` This is the username and password for the generic testing user. 
    - `username2` / `username22` This is the username and password for the generic testing user. 
- Games
    - Matchid 1-5 corresponding with Gameid 1-5 are partially-completely finished games you can look at by choosing the secondary UI and entering the gameid.
- Resetting.
    - Follow the steps above and kill the server, for openstack,  copy ~/test to ~/data/test with `sudo cp ~/test ~/data/`

## Base Expectations
- I have much of my code done in express
- I implemented my own user sessions, the code can be found in /connect4/src/api/resources/Auth.ts for the Validation, and api/routes/private.ts actually calls this function, to populate res.locals. (I wrote this before I knew of express-session, but it works fine, so I'm leaving it)
- I have integrated my game logic into my api, and have created request/response models. Currently it can all be found in the Connect4 Test page you see once logged in.
-

- So far, I have logic for the game itself, including a bunch of error checking. The typescript sources are in connect4/src/api/resources/Game.ts. By logging into the site, and visiting the [Connect 4 Test](http://localhost:9000/#/test) tab, you can see a bunch of buttons to manipulate a single instance of the game. There are further details on the page. The Web sources are in connect4/src/ui/views/test.html and test.js. The gateway with all the API methods is in connect4/src/ui/gateway.js. All the logic related to error handling and permission is built into the api itself, and is in connect4/src/api/routes/private/games.ts and games/pending.ts

## Additional Expectations
- API Planning. See the Routes.md file for details about planned and current API routes.
- See list at bottom of other things baked in, most of them are beyond the scope of this course

### Evaluation Guide
As you log in, you should see that my sessions work as you open up another browser/incognito tab and log in again. You may create a new account if you wish, or use the seeded ones. If you chose the former, you will find that my login/logout/signup/password resets work very well, and are pretty much finished. Once logged in, you can see that I currently only have two updated pieces of information on my user page, the username and email. You can view other's profiles at this point, but until I finish the friend/privacy integration, it will just show their email.

 You can click on Play Game and go to sample game to see the eventual canvas that the game will be played on. 

Go to the Connect4 Test and you will see instructions on how to test this. Essentially you need two different users logged in, and one acts as a primary user, and one acts as a secondary user. This page shows the workflow of the match request, acceptance, game play, and web sockets. Try, for example to Promote the acceptance to a game before accepting it from the other client. Try playing when it is not your turn. 

Next, Observe here that I have learned how to make a slightly less horrible UI than you might have seen on the Profile and Play Game pages. 

Next, try out the websockets. Connect to them first on both clients. This goes through an event bus I made (connect4/src/api/resources/bus.ts). You can send messages to the other client. You can also see how it will now auto refresh the board every time a move is made.

After you win, verify that the state of the game and winner are updated. Take note of the gameid

Optionally, test persistence and the database by stopping and starting the server, (docker commands are provided above, basically kill && rm, then up -d). If you restart it, log back in, and then go to the Connect 4 Test and Show the secondary ui, enter the gameid in the appropriate spot, you should see the state of the game exactly how it was left off.

If you look in connect4/src/api/public/user.ts and game/ts, you can see implementations of the required API for the project.


### Stuff that currently works
- Accounts
    - Logging In
    - Creating Account
    - Resetting Passwords
    - Logging Out
- Viewing user profiles (when logged in as `username2`, try changing the url to [this](http://localhost:9000/#/profile/1/). Currently it only sends email, this is a part of the permissions I said I need to work on).
- Everything on the Connect 4 Test Page
-

### Stuff I have to work on
- Make my UI look less like a monkey was on a keyboard with bootstrap classes for keys.
- Currently the navbar is broken when the viewport is too narrow.
- Integrate the functionality into the ui in the correct places, as opposed to having it all in the Connect 4 Test page
- Add Websocket support for game moves as well.
- Add front end and back end support for many of the missing GET queries, such as getting invited games
- Add filters on api routes for privacy settings. Ie respect privacy settings of users
- Document the massive API I have built for my front end.


## Extra Functionality and Testing instructions for these features
Note that I realize some of this is not possible for you to test, due to the time requirement, or it straight up not being compatible with your operating system.
- Security
    - Integrates a ton of error checking for resource access, to prevent a bad actor using the API to manipulate things the front end wouldn't allow.
- Web Socket support
    - This has not been taught yet I don't think. I have websockets on my test page. They use a custom solution to require a second step of verification, so that only clients the server deems permissable can recieve events from the event bus. Otherwise clients are disconnected in 1 minute.
- Docker Support.
    - I have made this into a containerized application. Follow the instructions to test on openstack to test that way.
- CD System.
    - A CD system allows for Continuous Delivery of the code. In this case, it allows me to use webhooks to automatically update the git repository on my server, run shell commands to build the app in a new dockerized container, and deploy it behind my custom reverse proxy. This adds the ssl certificate for https.
    - It requires access to the git repo, a public server, among other things, so testing the system itself is not practical. However you can view the result of the system using the link in the CD section of testing. Relevant code is in /auto-updater
- Custom Database Tooling
    - As a very roundabout way of not have to write sql for database interactions, I wrote an ORM that generates sql on the fly from models. For example, setting the userId attribute of a database model, and calling `.select()` on it, would return an array of all of the rows in the database with that userId. It supports `select()`,`update()`,`delete()` and `insert()`. These all work exactly the same as the provided example, except that `update` is able to check for the indexes in the given table, identify them, and use them as the `WHERE` clause in the generate SQL it runs. This logic is all in connect4/src/api/resources/databasehelpers.ts
    - SQL Generator. The ORM works on the assumption that every column is named the exact same as the attribute in the models. Run `node tools/generateSql.js ./connect4/src/api/models/models.ts  Databasemove` in the root direcotry of this project, and you should see a constuctor for the typescript model and sql table create command appear. This all comes from the attribute names and attribute types in the typescript models. The code is a mess of regular expressions, so it's not the best for clarity, but it works. The results of this have been pasted into connect4/src/api/gateway.ts
        - Supports foreign keys, defaults, types, and uniqueness constraints
- Typescript API
    - The API is built mostly with typescript, which (supposedly) helps it be less error prone and susceptible to bugs.
- Front End Framework
    - The front end is built on Aurelia, a front end framework
    - Allows easy seperation of static resources and API resources, for better scaleability
    - Reduces load on server.
    - Uses WebPack and minification to obfuscate code.
