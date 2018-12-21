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
let prePlayersReady = 0;
let playersReady = 0;
let pokerId = 1;
let pokerIdTurn = 3;
let flop = [[]];
let turn = [[]];
let river = [[]];
let flopRevealed = false;
let turnRevealed = false;
let riverRevealed = false;
let turnsTaken = 0;
let potTotal = 75;
let playersFolded = 0;


// Sockets

const io = socket(app.listen(SERVER_PORT, () => {
    console.log(`Pockie Rockies at ${SERVER_PORT}`)
}))

io.on('connection', socket => {
    console.log('User Connect');

    socket.on('join room', data => {
        console.log('Room joined', data.room)
        socket.join(data.room)
        prePlayersReady++
        io.to(data.room).emit('room joined', prePlayersReady);
    })

    socket.on('join game', data => {
        data.pokerId = pokerId
        pokerId++
        data.betTurn = false
        players.push(data)
        
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
            // If the pokerIdTurn excceds the length of the array it will start over at the beginning of the array of players
            if (pokerIdTurn > playersInHand.length) {
                pokerIdTurn = playersInHand[0].pokerId
                // console.log('poker turn', pokerIdTurn)
            } 
            // If the player doesn't have cards (they have folded) then the pokerIdTurn increments and the function is rerun
            if (pokerIdTurn === playersInHand[i].pokerId && playersInHand[i].cards.length === 0) {
                pokerIdTurn++
                preflopBetting(data)
            }  

            // If player doesn't have any money but they still have cards then data is sent to update the frontend and keep the cycle flowing without having the player take a turn
            else if (pokerIdTurn === playersInHand[i].pokerId && playersInHand[i].startMoney === 0) {
                io.to(data.room).emit('no money left', {playersInHand, potTotal})
            }

            // If the player has cards and their pokerId matches the turnId then it sets their turn to true
            else if (pokerIdTurn === playersInHand[i].pokerId) {
                playersInHand[i].betTurn = true
                io.to(data.room).emit('preflop betting', {playersInHand, potTotal})
            }
            
        }
    }

    socket.on('turn of preflop betting', data => {
        // console.log(data)
        pokerIdTurn++
        turnsTaken++
        for (let i = 0; i < playersInHand.length; i++) {
            // updates potTotal by looking at the difference in the old and new bet, but only if bet is not zero (prevents potTotal decreaseing on a fold)
            // Takes the player who just had a turn and updates the playersInHand array with their new information
            if (data.player[0].id === playersInHand[i].id) {
                if (data.player[0].bet !== 0) {
                let originalBet = playersInHand[i].bet
                let newBet = data.player[0].bet
                let changeInBet = newBet - originalBet;
                potTotal += changeInBet
                }
                
                playersInHand.splice(i, 1, data.player[0])
            }

            if (data.player[0].id === playersInHand[i].id && data.players[0].cards.length === 0) {
                playersFolded++
            }
        }
        
        // creates array of only players with cards
        let playersWithCardsToSort = [...playersInHand]

        let playersWithCards = playersWithCardsToSort.filter(player => {
            return player.cards.length !== 0
        })

        // .sort alters the original array, so I create a copy and then sort it so I can use the sorted values seperatlely
        let playersToSort = [...playersInHand]
        
        let highestBet = playersToSort.sort( (a, b) => {
            return b.bet - a.bet
        })[0]
        
        function checkBets (player) {
            return player.bet === highestBet.bet || player.startMoney === 0
        }
        // Checks if all players with cards have equal bets or if they are out of money, if not keep running betting
        // Also checks how many turns have been taken and which round of betting has commenced
        if (playersWithCards.every(checkBets) && riverRevealed && turnsTaken >= playersWithCards.length + playersFolded) {
            playersFolded = 0
            console.log('ready to evaluate hands')
        } else if (playersWithCards.every(checkBets) && turnRevealed && turnsTaken >= playersWithCards.length + playersFolded) {
            playersFolded = 0
            io.to(data.room).emit('river', river)
        } else if (playersWithCards.every(checkBets) && flopRevealed && turnsTaken >= playersWithCards.length + playersFolded) {
            playersFolded = 0
            io.to(data.room).emit('turn', turn)
        } else if (playersWithCards.every(checkBets) && turnsTaken >= playersWithCards.length + playersFolded){
            playersFolded = 0
            io.to(data.room).emit('flop', flop)
        } else {
            preflopBetting(data);
        }
        
    })

    // After flop has been sent this will reset the number of turns taken and whose turn it will be (through the pokerIdTurn)
    socket.on('flop betting', data => {
        pokerIdTurn = 1
        turnsTaken = 0
        flopRevealed = true

        playersInHand.forEach((val, i, arr) => {
            arr[i].bet = 0;
        })

        preflopBetting(data)
    })

    socket.on('turn betting', data => {
        pokerIdTurn = 1
        turnsTaken = 0
        turnRevealed = true

        playersInHand.forEach((val, i, arr) => {
            arr[i].bet = 0;
        })

        preflopBetting(data)
    })

    socket.on('river betting', data => {
        pokerIdTurn = 1
        turnsTaken = 0
        riverRevealed = true

        playersInHand.forEach((val, i, arr) => {
            arr[i].bet = 0;
        })

        preflopBetting(data)
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



