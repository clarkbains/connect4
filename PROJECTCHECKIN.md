# Project Check in 2

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
- To kill the service, run `docker-compose kill && docker-compose rm` on the openstack instance.
- To view logs of the system, navigate to `~/connect4` and run `dokcer-compose logs`

#### CD System
- I have set up a CD system, which means that you can visit [here](https://78y43y3ghfo7tyfgh43o74fye7w87fghw7fy.2406.clarkbains.com/) to see the latest version of the code, built and deployed on my own server.
- Setup for this is lengthy/complicated and instructions are not provided. 

### Seeded Data
I have included the same database in my submission as in both the openstack and CI system on my server. This means you should be able to use the same credentials no matter which platform you chose to evaluate using.
- Users
    - `bar` / `barbarbar` This is the username and password for the generic testing user. 
## Base Expectations
- As you will encounter when testing this, I most certainly have a server capable of serving static resources and API routes. The header is all linked together, and many of the buttons surrounding the login system are functional and redirect where needed.

- So far, I have logic for the game itself, including a bunch of error checking. The typescript sources are in connect4/src/api/resources/Game.ts. By logging into the site, and visiting the [Connect 4 Test](http://localhost:9000/#/test) tab, you can see a bunch of buttons to manipulate a single instance of the game. There are further details on the page. The Web sources are in connect4/src/ui/views/test.html and test.js. The gateway with all the API methods is in connect4/src/ui/gateway.js. All the logic related to error handling and permission is built into the api itself, and is in connect4/src/api/routes/private/games.ts and games/pending.ts

## Additional Expectations
- I am not doing server side rendering, because it limits the site to run under the one node process, which kills performance. I have opted to do all templating in the user's browser. The Profile page requests all data via AJAX and sets the 2 attributes at the top this way.
- AJAX, the entire page for buisiness logic uses AJAX requests to manipulate data server side. User creation, password resets, and logins also use ajax. Pretty much every page but the home page.
- API Planning. See the Routes.md file for details about planned and current API routes.

### Stuff I have to work on
- I want to do an event bus type thing where your client can subscribe to events, and get them over websockets. This is why I have not included messaging in this submission.
- Integrate the canvas into the game logic
- Work on user relations, ie friends and view permissions.
- Add in game messaging.
- Make my UI look less like a monkey was on a keyboard with bootstrap classes for keys.
- Currently the navbar is broken when the viewport is too narrow.


## Extra Functionality and Testing instructions
Note that I realize some of this is not possible for you to test, due to the time requirement, or it straight up not being compatible with your operating system.
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
    - The API is built mostly with typescript, which helps it be less error prone and susceptible to bugs.
- Front End Framework
    - The front end is built on Aurelia, a front end framework
    - Allows easy seperation of static resources and API resources, for better scaleability
    - Reduces load on server.
    - Uses WebPack and minification to obfuscate code.
- Session Support
    - Uses JWTs and passwords(not yet hashed+salted) to do a fairly robust login/logout. 
    - Integrates a ton of error checking for resource access, to prevent a bad actor using the API to manipulate things the front end wouldn't allow