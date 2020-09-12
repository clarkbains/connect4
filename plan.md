# Connect 4 Plan
--
# Scope Of Project
- Profiles
    - Name
    - Email
    - Score
    - Game History
    - Is Named Dave
    - Sessions
- Games (wss)
    - Realtime Playback
    - Should be able to play back
- Persistance
    - SQLlite

Models
- DB
    - Games
        - id
        - game_id
        - game_invite
        - game_start_date
        - winning_size ()
        - board size (4 < x < 100)
        - public (1 | 0)
        - winner (null | member_id)
    - Game members
        - game_id
        - member_id
    - Game Moves
        - move_id
        - coordinates
        - member_id
        - time
    - Member
        - member_id
        - email
        - name
        - salt
        - hash
- Internal
    - Board Representation
        - Board[][]
        - Member_ids[]
        - GameInfo
            - DB.Games
    - Move 

- Methods
    - _RetrieveBoardFromDb(game_id):Internal.Board Representation
    - _ComputeCoordinates(game_id, column_to_drop)
    - AddMove(game_id, column)
    - _GenerateInvite(id):id
    - _emi

- Request
    - login_req (username, password, otp_key):
    - password_reset (email):
    - account_create (name, email):
    - password_set (token_response):
    - account_update (profile):profile
    - search_profile (search):profile
    - start_game
- Response
    - login_failure (login_req):not validated | authed
    - token_response (account_create):(email, name, session_token)
    - login_success (login_req):JWT
    - profile ():(name, email, score, history, is named dave)

