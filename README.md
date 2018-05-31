# TriumfCoin

## Development server
###### 1 - clone repository to {local directory}.
###### 2 - install all dependencies from {local directory}/package.json, for example run 'npm i --save'.
###### 3 - Run 'npm start' for a development server. (recommendation pm2)
###### 4 - Navigate to 'http://localhost:process.env.PORT/'. 
###### 5 - Run nodemon for a local dev 
###### 6 - The app will automatically reload if you change any of the source files.

## Project structure
###### routes -         Action response
###### config -         Configuration project
###### controllers -    Controllers project
###### exec -           Run script 
###### lib -            Manual library
###### logs -           Logs project
###### models -         MongoDB models 
###### test -           Tests 
####### test\API -      Tests API
####### test\UNIT -     Tests Unit
####### test\SERVICES - Tests Environment(Virtual RPC Client)
###### app.js -         Start project app
###### crontab.js -     Crontab task 