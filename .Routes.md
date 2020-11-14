# Routes
The following is likley not complete, while designing the front end I will run into issues where it makes more sense to change things up a bit

├── private
│   ├── games
│   │   ├── GET/                                Get your active games
│   │   ├── GET/:gameid                         Get info about one of your games
│   │   ├── GET/:gameid/board                   Get the board state of your game
│   │   ├── GET/:gameid/state                   Get the state (finished/not finished) of a game
│   │   ├── GET/:gameid/turn                    Check who's turn it is for a game
│   │   ├── GET/:gameid/winner                  Check the winner of a game
│   │   ├── GET/:gameid/observe                 Info about a games final stae and event bus informations to watch interactions in real time
│   │   ├── pending
│   │   │   ├── GET/                            Get all requests for games
│   │   │   ├── GET/request/:requestid          Get Details of a request for a game
│   │   │   ├── GET/request/:requestid/accept   Accept a game request
│   │   │   ├── GET/request/:requestid/deny     Deny a game request
│   │   │   ├── POST/                           Create Game Request
│   │   │   ├── POST/:matchid/acceptAll         Dev Endpoint to force all users to accept
│   │   │   └── POST/:matchid/promote           Promotes a Request to a game once everyone has accepted
│   │   ├── POST/:gameid/messages               Posts a message for a game. Getting will be done via websockets
│   │   └── POST/game/:moves                    Add a move to a game
│   └── users
│       ├── DELETE/me                           Delete an account
│       ├── GET/me                              Get your own info
│       ├── GET/me/friendrequests               Get your pending friend requests
│       ├── GET/me/friends                      Get your current friends
│       ├── GET/:userid                         Get anothers users basic information if not private
│       ├── PATCH/me                            Modify your own data
│       ├── POST/me/:friendrequestid/accept     Accept a friend request
│       ├── POST/me/:friendrequestid/deny       Deny a friend request
│       └── POST/:userid/friendrequests         Send a friend request
└── public
    └── users
        ├── GET/sendresetemail                  Sends an email with JWT for password reset
        ├── POST/                               Creates an account
        ├── POST/changepassword                 Changes password
        └── POST/login                          Returns a session cookie
        └── GET /logout                         Returns a blank session cookie   