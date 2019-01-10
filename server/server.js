require('dotenv').config()
const express = require('express');
const massive = require('massive');
const session = require('express-session');
const controller = require('./controller');
const socket = require('socket.io');
const {decks} = require('cards');
const _ = require('lodash');
const {evaluateCards} = require('phe');

let { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env

const app = express();
app.use(express.json())

app.use( express.static( `${__dirname}/../build` ) );

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
app.get('/api/personal/:id', controller.getPersonal);
app.put('/api/updateStats', controller.updateStats);
app.delete('/api/delete/:id', controller.deleteAccount);


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
let reshuffle = true;


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
                let longName = cards[i].rank.longName
                let card = rank + suit
                let longCard = longName + suit
                cardArr.push(card, longCard)
            }
            return cardArr
        }

        playersInHand = []

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

        io.to(data.room).emit('dealt out', playersInHand)
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

    // First sets each player at an equal score, then evaluates the score of each player that still has cards and will return the winner
    function evaluateHands(data) {
        for (let i = 0; i < playersInHand.length; i++) {
            playersInHand[i].score = 10000
        }

        for (let i = 0; i < playersInHand.length; i++) {
            if(playersInHand[i].cards.length !== 0) {
                let bAndH = [];
                bAndH.push(flop[0][0], flop[0][2], flop[0][4], turn[0][0], river[0][0], playersInHand[i].cards[0], playersInHand[i].cards[2])
                let boardAndHand = _.flattenDeep(bAndH)
                let score = evaluateCards(boardAndHand)
                playersInHand[i].score = score;
            }
        }

        // After giving each player a score, each player will be checked to see who has the lowest score
        let playersToCheckScore = [...playersInHand]
        let rankedScores = playersToCheckScore.sort( (a, b) => {
            return a.score - b.score
        })

        // Creating a winners array to check if there are multiple winners and how many ways the pot needs to be split
        let winners = [];

        for (let i = 0; i < rankedScores.length; i++) {
            if (rankedScores[i].score === rankedScores[0].score) {
                winners.push(rankedScores[i])
            }
        }

        let winnings = potTotal / winners.length

        // loop through each player in playersInHand and compare it against each winner to see if there are matching id's. If so then add the winnings to their money
        for (let i = 0; i < playersInHand.length; i++) {
            for (let k = 0; k < winners.length; k++) {
                if (playersInHand[i].id === winners[k].id) {
                    playersInHand[i].startMoney += winnings
                }
            }
        }

        // Update the players array with the correct money amount for each player from the playersInHand array before sending the winnder
        for (let i = 0; i < players.length; i++) {
            players[i].startMoney = playersInHand[i].startMoney
        }

        let winnerNames = []

        for (let i = 0; i < winners.length; i++) {
            winnerNames.push(winners[i].username)
        }

        io.to(data.room).emit('winners', {winnerNames, potTotal})
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

            if (data.player[0].id === playersInHand[i].id && data.player[0].cards.length === 0) {
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
            evaluateHands(data)
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

    // start the next hand
    socket.on('start next hand', data => {
            pokerIdTurn = 3;
            flop = [[]];
            turn = [[]];
            river = [[]];
            flopRevealed = false;
            turnRevealed = false;
            riverRevealed = false;
            turnsTaken = 0;
            potTotal = 75;
            playersFolded = 0;
            reshuffle = false;

            // Checks to make sure the first person in the array didn't leave the game. If they are still there this will move them to the end of the array.
            if (players[0].pokerId === 1) {
                let dealer = players.shift();
                players.push(dealer)
            }
            
            players.forEach((player, i, arr) => {
                arr[i].pokerId = i + 1
                arr[i].cards = []
                arr[i].bet = 0
                arr[i].betTurn = false
            })
        
        shuffleAndDeal(players, data)
    })

    socket.on('leave game', data => {
        for (let i = 0; i < players.length; i++) {
            if (data.id === players[i].id) {
                players.splice(i, 1)
            }
        }
        console.log('Left Room', data.room)
        socket.leave(data.room)
    })



    socket.on('disconnect', () => {
        console.log('User disconnected')
    })
})

