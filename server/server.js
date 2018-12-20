require('dotenv').config()
const express = require('express');
const massive = require('massive');
const session = require('express-session');
const controller = require('./controller');
const socket = require('socket.io');
const {decks} = require('cards');

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

})

app.post('/auth/register', controller.register);
app.post('/auth/login', controller.login);
app.get('/api/leaderboard', controller.getLeaderboard);


// GamePlay Data for Sockets

let players = [];
let playersInHand = [];
let playersReady = 0;
let pokerId = 1;
pokerIdTurn = 3;
let flop = [[]];
let turn = [[]];
let river = [[]];


// Sockets

const io = socket(app.listen(SERVER_PORT, () => {
    console.log(`Pockie Rockies at ${SERVER_PORT}`)
}))

io.on('connection', socket => {
    console.log('User Connect');

    socket.on('join room', data => {
        console.log('Room joined', data.room)
        socket.join(data.room)
        io.to(data.room).emit('room joined');
    })

    socket.on('join game', data => {
        data.pokerId = pokerId
        pokerId++
        data.betTurn = false
        players.push(data)
        console.log(players)
    })

    socket.on('ready', data => {
        playersReady++
        if (playersReady === players.length) {
            shuffleAndDeal(players, data)
        }
    })

    // Preflop - Dealing

    function shuffleAndDeal(players, data) {
        const deck = new decks.StandardDeck({jokers: 0})
        deck.shuffleAll();

        function deSorter(cards) {
            let cardArr = []
            for (let i = 0; i < cards.length; i++) {
                let suit = cards[i].suit.name[0]
                let rank = cards[i].rank.shortName
                let card = rank + suit
                cardArr.push(card)
            }
            return cardArr
        }

        let playersWithCards = []

        for (let i = 0; i < players.length; i++) {
            let cards = deck.draw(2)
            let sortedCards = deSorter(cards)
            players[i].cards = sortedCards
            if (players[i].pokerId === 1) {
                players[i].bet = 25
                players[i].startMoney -= 25
            } else if (players[i].pokerId === 2) {
                players[i].bet = 50
                players[i].startMoney -= 50
            } else {
                players[i].bet = 0
            }
            playersInHand.push(players[i])
            playersWithCards.push(players[i])
        }

        // Deal Board
        let dealtFlop = deck.draw(3)
        let dealtTurn = deck.draw(1)
        let dealtRiver = deck.draw(1)

        // DeSort Board
        let sortedFlop = deSorter(dealtFlop)
        let sortedTurn = deSorter(dealtTurn)
        let sortedRiver = deSorter(dealtRiver)

        // Store Board for later use
        flop.splice(0, 1, sortedFlop)
        turn.splice(0, 1, sortedTurn)
        river.splice(0, 1, sortedRiver)

        io.to(data.room).emit('dealt out', playersWithCards)
        preflopBetting(data)
    }

    function preflopBetting(data) {
        for ( let i = 0; i < playersInHand.length; i++) {
            if (pokerIdTurn > playersInHand.length) {
                pokerIdTurn = playersInHand[0].pokerId
                console.log('poker turn', pokerIdTurn)
            } 
            if (pokerIdTurn === playersInHand[i].pokerId) {
                playersInHand[i].betTurn = true
                io.to(data.room).emit('preflop betting', playersInHand)
                console.log('emitted betting')
            }
        }
    }

    socket.on('turn of preflop betting', data => {
        // console.log(data)
        pokerIdTurn++
        for (let i = 0; i < playersInHand.length; i++) {
            if (data.player[0].id === playersInHand[i].id) {
                playersInHand.splice(i, 1, data.player[0])
                console.log('after bet', playersInHand)
            }
        }

        function checkBets (player) {
            return player.bet === data.player[0].bet
        }

        if(playersInHand.every(checkBets)){
            console.log('Betting round finished')
        } else {
            preflopBetting(data);
            console.log('reran preflop betting')
        }
    })



    socket.on('disconnect', () => {
        console.log('User disconneted')
    })
})

// Preflop - Dealing

// class Dealing {
//     constructor(){

//     }

//     shuffleAndDeal(players, cb) {
//         const deck = new decks.StandardDeck({jokers: 0})
//         deck.shuffleAll();

//         function deSorter(cards) {
//             let cardArr = []
//             for (let i = 0; i < cards.length; i++) {
//                 let suit = cards[i].suit.name[0]
//                 let rank = cards[i].rank.shortName
//                 let card = rank + suit
//                 cardArr.push(card)
//             }
//             return cardArr
//         }

//         for (let i = 0; i < players.length; i++) {
//             let cards = deck.draw(2)
//             let sortedCards = deSorter(cards)
//             players[i].cards = sortedCards
//             playersInHand.push(player[i])
//         }
//         socket.emit('deal', playersInHand)
//     }
// }



