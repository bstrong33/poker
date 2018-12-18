require('dotenv').config()
const express = require('express');
const massive = require('massive');
const session = require('express-session');
const controller = require('./controller');
const socket = require('socket.io');

let { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env

const app = express();
app.use(express.json())

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

massive(CONNECTION_STRING).then( db => {
    app.set('db', db);

    app.listen(SERVER_PORT, () => {
        console.log(`Pockie Rockies at ${SERVER_PORT}`)
    })
})

app.post('/auth/register', controller.register);
app.post('/auth/login', controller.login);
app.get('/api/leaderboard', controller.getLeaderboard);
