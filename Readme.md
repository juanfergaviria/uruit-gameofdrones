# **Game of Drones**
## A Rock, Papper, Scissors game
### Technical Test for UruIT
By _Juan Fernando Gaviria S._ jfgaviria@gmail.com

### Prerequisites
1. NodeJS
2. SailsJS
3. MongoDB

### Installation
1. cd backend/
2. npm install
3. cd frontend/
4. npm install
5. bower install
6. Run mongo query: db.movements.insertMany([{"name":"Papper","kills":"Rock"},{"name":"Rock","kills":"Scissors"},{"name":"Scissors","kills":"Papper"}])

**Note:** Modify **backend/config/connections.js** if you required it

### Run
1. Load MongoDB (usually mongod)
2. cd backend/
3. sails lift
4. cd frontend/
5. gulp default