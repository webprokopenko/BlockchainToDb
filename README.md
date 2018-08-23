# TriumfCoin

## Development server
##### 1 - clone repository to {local directory}.
##### 2 - install all dependencies from {local directory}/package.json, for example run 'npm install'.
##### 3 - create folders && files: ./config/config.json, /logs, /logs/geth
##### 4 - Run 'npm start' for a development server. (recommendation pm2)
##### 5 - Navigate to 'http://localhost:process.env.PORT/'. 
##### 6 - Run nodemon for a local dev 
##### 7 - The app will automatically reload if you change any of the source files.

## Project structure
###### routes           - Action response
###### config           - Configuration project
###### controllers      - Controllers project
###### exec             - Run script 
###### lib              - Manual library
###### logs             - Logs project
###### models           - MongoDB models 
###### test             - Tests (../node_modules/mocha/bin/mocha ./API/ETH_API.js)
###### test\API         - Tests API
###### test\UNIT        - Tests Unit
###### test\SERVICES    - Tests Environment(Virtual RPC Client)
###### test\db_test     - Test mongodb data
###### test\db_test     - (parsed block (ETH) 3244285,3244284,3244283,1244073,1244074)
###### app.js           - Start project app
###### crontab.js       - Crontab task 
