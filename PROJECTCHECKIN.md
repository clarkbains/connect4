# Project Check in
---
Clark Bains
101149052


I realize this project is very large and not very well organized. Hopefully this document guides you through as you mark my check in.
I will sumarize the README, but if you are looking for more info that I don't cover in this document, please check that document.

BUILDING/RUNNING
- `npm run build` and then `npm run deploy:local`. If you can't get it to work, check [here](https://78y43y3ghfo7tyfgh43o74fye7w87fghw7fy.2406.clarkbains.com/), 
Login is `bar` and `barbarbar` in both systems, or you can use the reset password to change it
I have set up a CI system.

All the HTML and JS can be found in connect4/src/ui/views. I will polish it up as I go.

A (not great) description of the files can be found in `./files.text`. A better, though less complete description can be found in `README.md`
Responsiveness is not guaranteed, and should be viewed in a full screen browser. Aka the nav bar in hamburger mode is broken at the moment

A rough outline of objects can be found as implemented classes in connect4/src/api/models/models.ts

Added Functionality that hopefully gets be extra marks. 
- API is like half implemented, supporting login, sessions, and "priveledged data" (Other user profiles).
- I used a front end framework (Aurelia)
- I added docker support (And a CI system that auto deploys it)
- I wrote a script to auto generate SQL create table commands from TypeScript models
- I set up a DB
- I wrote a custom ORM, that supports async CRUD operations.