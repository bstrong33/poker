import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import Twoc from './CardImages/2c.png';
import Twod from './CardImages/2d.png';
import Twoh from './CardImages/2h.png';
import Twos from './CardImages/2s.png';
import Threec from './CardImages/3c.png';
import Threed from './CardImages/3d.png';
import Threeh from './CardImages/3h.png';
import Threes from './CardImages/3s.png';
import Fourc from './CardImages/4c.png';
import Fourd from './CardImages/4d.png';
import Fourh from './CardImages/4h.png';
import Fours from './CardImages/4s.png';
import Fivec from './CardImages/5c.png';
import Fived from './CardImages/5d.png';
import Fiveh from './CardImages/5h.png';
import Fives from './CardImages/5s.png';
import Sixc from './CardImages/6c.png';
import Sixd from './CardImages/6d.png';
import Sixh from './CardImages/6h.png';
import Sixs from './CardImages/6s.png';
import Sevenc from './CardImages/7c.png';
import Sevend from './CardImages/7d.png';
import Sevenh from './CardImages/7h.png';
import Sevens from './CardImages/7s.png';
import Eightc from './CardImages/8c.png';
import Eightd from './CardImages/8d.png';
import Eighth from './CardImages/8h.png';
import Eights from './CardImages/8s.png';
import Ninec from './CardImages/9c.png';
import Nined from './CardImages/9d.png';
import Nineh from './CardImages/9h.png';
import Nines from './CardImages/9s.png';
import Tenc from './CardImages/10c.png';
import Tend from './CardImages/10d.png';
import Tenh from './CardImages/10h.png';
import Tens from './CardImages/10s.png';
import Jackc from './CardImages/Jc.png';
import Jackd from './CardImages/Jd.png';
import Jackh from './CardImages/Jh.png';
import Jacks from './CardImages/Js.png';
import Queenc from './CardImages/Qc.png';
import Queend from './CardImages/Qd.png';
import Queenh from './CardImages/Qh.png';
import Queens from './CardImages/Qs.png';
import Kingc from './CardImages/Kc.png';
import Kingd from './CardImages/Kd.png';
import Kingh from './CardImages/Kh.png';
import Kings from './CardImages/Ks.png';
import Acec from './CardImages/Ac.png';
import Aced from './CardImages/Ad.png';
import Aceh from './CardImages/Ah.png';
import Aces from './CardImages/As.png';


class GamePlay extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ready: false,
            player: [],
            otherPlayers: [],
            allPlayers: [],
            room: '',
            joined: false,
            joinPressed: false,
            numberOfPlayersReady: 0,
            allPlayersJoined: false,
            betAmount: 0,
            betAllowed: true,
            enoughMoney: true,
            betTurn: false,
            canCall: true,
            canCheck: false,
            flop: null,
            turn: null,
            river: null,
            winnerNames: null,
            potTotal: 75,
            cards: [{ image: Twoc, name: 'Twoc' }, { image: Twod, name: 'Twod' }, { image: Twoh, name: 'Twoh' }, { image: Twos, name: 'Twos' }, { image: Threec, name: 'Threec' }, { image: Threed, name: 'Threed' }, { image: Threeh, name: 'Threeh' }, { image: Threes, name: 'Threes' }, { image: Fourc, name: 'Fourc' }, { image: Fourd, name: 'Fourd' }, { image: Fourh, name: 'Fourh' }, { image: Fours, name: 'Fours' }, { image: Fivec, name: 'Fivec' }, { image: Fived, name: 'Fived' }, { image: Fiveh, name: 'Fiveh' }, { image: Fives, name: 'Fives' }, { image: Sixc, name: 'Sixc' }, { image: Sixd, name: 'Sixd' }, { image: Sixh, name: 'Sixh' }, { image: Sixs, name: 'Sixs' }, { image: Sevenc, name: 'Sevenc' }, { image: Sevend, name: 'Sevend' }, { image: Sevenh, name: 'Sevenh' }, { image: Sevens, name: 'Sevens' }, { image: Eightc, name: 'Eightc' }, { image: Eightd, name: 'Eightd' }, { image: Eighth, name: 'Eighth' }, { image: Eights, name: 'Eights' }, { image: Ninec, name: 'Ninec' }, { image: Nined, name: 'Nined' }, { image: Nineh, name: 'Nineh' }, { image: Nines, name: 'Nines' }, { image: Tenc, name: 'Tenc' }, { image: Tend, name: 'Tend' }, { image: Tenh, name: 'Tenh' }, { image: Tens, name: 'Tens' }, { image: Jackc, name: 'Jackc' }, { image: Jackd, name: 'Jackd' }, { image: Jackh, name: 'Jackh' }, { image: Jacks, name: 'Jacks' }, { image: Queenc, name: 'Queenc' }, { image: Queend, name: 'Queend' }, { image: Queenh, name: 'Queenh' }, { image: Queens, name: 'Queens' }, { image: Kingc, name: 'Kingc' }, { image: Kingd, name: 'Kingd' }, { image: Kingh, name: 'Kingh' }, { image: Kings, name: 'Kings' }, { image: Acec, name: 'Acec' }, { image: Aced, name: 'Aced' }, { image: Aceh, name: 'Aceh' }, { image: Aces, name: 'Aces' }]
        }
    }

    // Initilizing socket connection, room, and dealing
    componentDidMount() {
        let { username, id, initialMoney } = this.props
        let startMoney = parseInt(initialMoney);
        this.socket = io();
        this.socket.on('room joined', data => {
            this.joinSuccess(data)
        })
        this.socket.emit('join game', { username, id, startMoney })
        this.socket.on('dealt out', this.viewCards)
        this.socket.on('preflop betting', this.allowPreflopBetting)
        this.socket.on('no money left', this.noMoneyLeft)
        this.socket.on('flop', this.setFlop)
        this.socket.on('turn', this.setTurn)
        this.socket.on('river', this.setRiver)
        this.socket.on('winners', this.displayWinners)
    }

    // Creating room
    joinRoom = () => {
        this.setState({
            joinPressed: true
        })
        if (this.state.room) {
            this.socket.emit('join room', {
                room: this.state.room
            })
        }
    }

    joinSuccess = (data) => {
        this.setState({
            joined: true,
            numberOfPlayersReady: data
        })
    }

    // Becoming ready to play so dealing can begin
    readyToPlay = () => {
        this.setState({
            ready: true
        })
        this.socket.emit('ready', { room: this.state.room })
    }

    // recieiving cards from server and setting state to be able to display these cards
    viewCards = players => {
        let otherPlayers = []
        let { id } = this.props
        for (let i = 0; i < players.length; i++) {
            if (players[i].id === id) {
                const updatedPlayerHand = []
                updatedPlayerHand.push(players[i])
                this.setState({ player: updatedPlayerHand })
            }
            else {
                otherPlayers.push(players[i])
            }
        }

        let allPlayers = [...players]
        reArrangeOrder(allPlayers)
        function reArrangeOrder(allPlayers) {
            if (allPlayers[0].id !== id) {
                let first = allPlayers.shift()
                allPlayers.push(first)
                reArrangeOrder(allPlayers)
            }
        }
        this.setState({ otherPlayers, allPlayersJoined: true, joined: false, allPlayers })
    }

    // Preflop Betting
    allowPreflopBetting = data => {
        let { playersInHand, potTotal } = data
        let { id } = this.props
        let otherPlayers = []
        for (let i = 0; i < playersInHand.length; i++) {
            // if it is the players turn to bet (sent from server), then betTurn will be true which triggers a ternary in the render
            if (playersInHand[i].id === this.props.id && playersInHand[i].betTurn === true) {

                let playersToSort = [...playersInHand];
                let highestBet = playersToSort.sort((a, b) => {
                    return b.bet - a.bet
                })[0]

                // If players bet is already equal to the highest bet then they will have the option to check instead of call
                if (playersInHand[i].bet === highestBet.bet) {
                    this.setState({
                        betTurn: true,
                        canCheck: true
                    })
                } else {
                    this.setState({
                        betTurn: true,
                        canCheck: false
                    })
                }
            }

            // updates players and otherPlayers in state to reference for betting purposes
            if (playersInHand[i].id === this.props.id) {
                const updatedPlayerHand = []
                updatedPlayerHand.push(playersInHand[i])
                this.setState({
                    player: updatedPlayerHand
                })
            }
            else {
                otherPlayers.push(playersInHand[i])
            }
        }
        let allPlayers = [...playersInHand]
        reArrangeOrder(allPlayers)
        function reArrangeOrder(allPlayers) {
            if (allPlayers[0].id !== id) {
                let first = allPlayers.shift()
                allPlayers.push(first)
                reArrangeOrder(allPlayers)
            }
        }
        this.setState({ otherPlayers, potTotal, allPlayers })
    }

    // This function will fire if the player has no money in order to update the screen but bypass needing to have the player take a turn
    noMoneyLeft = data => {
        let { playersInHand, potTotal } = data
        let { id } = this.props
        let otherPlayers = []

        for (let i = 0; i < playersInHand.length; i++) {
            // updates players and otherPlayers in state to reference for betting purposes
            if (playersInHand[i].id === this.props.id) {
                const updatedPlayerHand = []
                updatedPlayerHand.push(playersInHand[i])
                this.setState({
                    player: updatedPlayerHand
                })
            }
            else {
                otherPlayers.push(playersInHand[i])
            }
        }
        let allPlayers = [...playersInHand]
        reArrangeOrder(allPlayers)
        function reArrangeOrder(allPlayers) {
            if (allPlayers[0].id !== id) {
                let first = allPlayers.shift()
                allPlayers.push(first)
                reArrangeOrder(allPlayers)
            }
        }
        this.setState({ otherPlayers, potTotal, allPlayers },
            () => this.displayPreflopBetting())
    }

    setPreflopBetting = () => {

        let playersToSort = [...this.state.otherPlayers];
        let highestBet = playersToSort.sort((a, b) => {
            return b.bet - a.bet
        })[0]

        let { betAmount } = this.state;

        // Spreading player from state so it can be edited
        let player = [...this.state.player];

        // checking if player has enough money to make a bet and setting logic for the edge cases when they can't follow the typical betting rules because of having too little money
        if (player[0].startMoney < 2 * highestBet.bet) {
            if (parseInt(betAmount) === player[0].startMoney) {
                let bettedAmount = parseInt(betAmount)
                player[0].bet += bettedAmount;
                player[0].startMoney -= bettedAmount
                player[0].betTurn = false

                this.setState({
                    betTurn: false,
                    player,
                    betAllowed: true,
                    enoughMoney: true,
                    canCall: true
                }, () => this.displayPreflopBetting())
            } else {
                this.setState({ enoughMoney: false, betAllowed: true, canCall: true })
            }
        } else if (player[0].startMoney < 50) {
            if (betAmount !== 25) {
                this.setState({ enoughMoney: false, betAllowed: true, canCall: true })
            } else {
                let bettedAmount = parseInt(betAmount)
                player[0].bet += bettedAmount;
                player[0].startMoney -= bettedAmount
                player[0].betTurn = false

                this.setState({
                    betTurn: false,
                    player,
                    betAllowed: true,
                    enoughMoney: true
                }, () => this.displayPreflopBetting())
            }
        }
        else {
            // check value of bet to ensure it is at least 50, is divisible by 25, and is double the highest bet on the board
            if (betAmount >= 50 && betAmount % 25 === 0 && betAmount / highestBet.bet >= 2) {
                // Check if player has enough money to make the delcared bet
                if (player[0].startMoney >= parseInt(betAmount)) {
                    // Adding the amount betted to the total bet
                    player[0].bet += parseInt(betAmount);

                    // Decreasing money by amount betted
                    let bettedAmount = parseInt(betAmount);
                    player[0].startMoney -= bettedAmount

                    // Changing status so it is no longer set to allow betting in the player object
                    player[0].betTurn = false

                    this.setState({
                        betTurn: false,
                        player,
                        betAllowed: true,
                        enoughMoney: true
                    }, () => this.displayPreflopBetting())
                } else {
                    this.setState({ enoughMoney: false, betAllowed: true })
                }
            } else {
                this.setState({
                    betAllowed: false,
                    enoughMoney: true
                })
            }
        }
    }

    // Sending updated bet to server so it can be displayed to all players
    displayPreflopBetting = () => {
        this.socket.emit('turn of preflop betting', {
            room: this.state.room, player: this.state.player
        })
    }

    displayflopBetting = () => {
        this.socket.emit('flop betting', {
            room: this.state.room
        })
    }

    displayTurnBetting = () => {
        this.socket.emit('turn betting', {
            room: this.state.room
        })
    }

    displayRiverBetting = () => {
        this.socket.emit('river betting', {
            room: this.state.room
        })
    }

    // Call bet
    callBet = () => {
        // Finds the highest current bet on the table
        let sortedOtherPlayers = [...this.state.otherPlayers]
        let highestBet = sortedOtherPlayers.sort((a, b) => {
            return b.bet - a.bet
        })[0]

        let player = [...this.state.player];
        let { bet } = player[0];

        if (player[0].startMoney + player[0].bet >= highestBet.bet) {
            // startMoney only changes by the amount being called while still displaying the total amount of money bet
            let callAmount = highestBet.bet - bet
            player[0].bet = highestBet.bet
            player[0].startMoney -= callAmount
            player[0].betTurn = false;

            this.setState({
                betTurn: false,
                player,
                betAllowed: true,
                enoughMoney: true
            }, () => this.displayPreflopBetting())
        } else {
            this.setState({
                canCall: false,
                betAllowed: true,
                enoughMoney: true
            })
        }
    }

    // check
    check = () => {

        let player = [...this.state.player]
        player[0].betTurn = false

        this.setState({
            betTurn: false,
            player,
            betAllowed: true,
            enoughMoney: true
        }, () => this.displayPreflopBetting())
    }

    // fold cards
    fold = () => {
        let player = [...this.state.player];

        player[0].cards = [];
        player[0].betTurn = false;
        player[0].bet = 0;

        this.setState({
            betTurn: false,
            player,
            betAllowed: true,
            enoughMoney: true,
            canCall: true
        }, () => this.displayPreflopBetting())
    }

    // recieve flop (or turn or river) from server and set state to display the flop
    setFlop = flop => {
        this.setState({ flop }, () => this.displayflopBetting())
    }

    setTurn = turn => {
        this.setState({ turn }, () => this.displayTurnBetting())
    }

    setRiver = river => {
        this.setState({ river }, () => this.displayRiverBetting())
    }

    displayWinners = data => {
        let { winnerNames, potTotal } = data
        console.log(winnerNames)
        this.setState({ winnerNames, potTotal }, () => this.viewingWinners())
    }

    viewingWinners = () => {
        setTimeout(() => {
            this.setState({
                winnerNames: null,
                potTotal: 75,
                flop: null,
                turn: null,
                river: null,
                joined: false
            }, () => this.startNextHand())
        }, 30000)
    }

    startNextHand = () => {
        console.log(this.state.player)
        if (this.state.player[0].pokerId === 2) {
            console.log('ran');
            this.socket.emit('start next hand', {
                room: this.state.room
            })
        }
    }

    leaveGame = () => {
        let { initialMoney } = this.props
        let { player } = this.state

        let moneyMade = player[0].startMoney - initialMoney

        axios.put('/api/updateStats', {
            moneyMade,
            id: this.props.id
        })

        this.socket.emit('leave game', {
            room: this.state.room,
            id: this.props.id
        })
    }


    render() {

        // Each player will be looped over and run through this function in order to display their cards
        let showCards = (player) => {
            let { cards } = this.state
            let cardOne = null
            let cardTwo = null
            for (let i = 0; i < cards.length; i++) {
                if (player.cards[1] === cards[i].name) {
                    cardOne = <img src={cards[i].image} alt='player card 1' />
                }
                if (player.cards[3] === cards[i].name) {
                    cardTwo = <img src={cards[i].image} alt='player card 2' />
                }
            }
            if (cardOne !== null && cardTwo !== null) {
                return (
                    <div className='cards'>
                        {cardOne}
                        {cardTwo}
                    </div>
                )
            }
        }

        let mappedPlayers = this.state.allPlayers.map((player, i) => {
            let cards = showCards(player)
            return (
                <div key='player.id'>
                    {i === 0 ?
                        <div className={`seat${i}`}>
                            {cards}
                            <p>{player.username}: ${player.startMoney}</p>
                            {player.betTurn ? <div className='action'></div> : null}
                            <p>Bet: ${player.bet}</p>
                            {player.pokerId === 1 ? 
                            <div className='SB'>SB</div> :
                            player.pokerId === 2 ?
                            <div className='BB'>BB</div> :
                            player.pokerId === this.state.allPlayers.length ?
                            <div className='D'>D</div>: null}
                        </div> :
                        <div className={`seat${i}`}>
                            {this.state.winnerNames ?
                                <div>
                                    {cards}
                                </div> :
                                player.cards.length !== 0 ?
                                    <div className='cards'>
                                        <img src='https://cdn.shopify.com/s/files/1/0200/7616/products/playing-cards-superior-classic-back-1_1024x1024.png?v=1530155531' alt='card back' />
                                        <img src='https://cdn.shopify.com/s/files/1/0200/7616/products/playing-cards-superior-classic-back-1_1024x1024.png?v=1530155531' alt='card back' />
                                    </div> : null}
                            <p>{player.username}: ${player.startMoney}</p>
                            {player.betTurn ? <div className='action'></div> : null}
                            <p>Bet: ${player.bet}</p>
                            {player.pokerId === 1 ? 
                            <div className='SB'>SB</div> :
                            player.pokerId === 2 ?
                            <div className='BB'>BB</div> :
                            player.pokerId === this.state.allPlayers.length ?
                            <div className='D'>D</div>: null}
                        </div>}
                </div>
            )
        })

        // When the flop is sent from the backend, this function will be fired to display the flop images
        let displayFlopImages = (flop) => {
            let { cards } = this.state
            let cardOne = null
            let cardTwo = null
            let cardThree = null
            for (let i = 0; i < cards.length; i++) {
                if (flop[0][1] === cards[i].name) {
                    cardOne = <img src={cards[i].image} alt='player card 1' />
                }
                if (flop[0][3] === cards[i].name) {
                    cardTwo = <img src={cards[i].image} alt='player card 2' />
                }
                if (flop[0][5] === cards[i].name) {
                    cardThree = <img src={cards[i].image} alt='player card 3' />
                }
            }
            if (cardOne !== null && cardTwo !== null && cardThree !== null)
                return (
                    <div className='flop'>
                        {cardOne}
                        {cardTwo}
                        {cardThree}
                    </div>
                )
        }

        let displayTurnAndRiver = (card) => {
            let { cards } = this.state
            let cardOne = null
            for (let i = 0; i < cards.length; i++) {
                if (card[0][1] === cards[i].name) {
                    cardOne = <img src={cards[i].image} alt='player card 1' />
                }
            }
            if (cardOne !== null) {
                return (
                    <div className='turn'>
                        {cardOne}
                    </div>
                )
            }
        }


        return (
            <div className='whole-game-view'>
            <div className='poker-table'>
                {/* When a room has been joined the room name will display  */}
                {/* {this.state.joined ?
                    <div className='players-joined'>
                        <h1> My Room: {this.state.room}</h1>
                        <h1> Number of Players Ready: {this.state.numberOfPlayersReady}</h1>
                    </div> : null} */}

                {/* When a room has been joined then the player can ready up. After all players are ready, cards can be displayed */}
                {this.state.joinPressed === false ?
                    <div className='join-room'>
                        <h3>Type the table name you would like to join</h3>
                        <input value={this.state.room} onChange={e => this.setState({ room: e.target.value })} />
                        <button onClick={this.joinRoom}>Join</button>
                    </div> :
                    // Checks if all players including self has indicated they are ready to play
                    this.state.ready === false ?
                        <div className='players-joined'>
                            <h1> My Room: {this.state.room}</h1>
                            <h1> Number of Players Ready: {this.state.numberOfPlayersReady}</h1>
                            <button onClick={() => this.readyToPlay()}>Ready</button>
                            <h1>Click Ready, only when all players are ready</h1>
                        </div> :
                        this.state.allPlayersJoined ?
                            // This is where gameplay is displayed
                            <div className='gameplay'>
                                {/* Displays pot total as it changes */}
                                <p className='pot'>Pot Total: ${this.state.potTotal}</p>
                                {/* Display the winner for everyone to see */}
                                {this.state.winnerNames ? <h1>Winner: {this.state.winnerNames}</h1> : null}
                                {mappedPlayers}
                                {/* PreFlop betting ternary, checks if it is players turn to bet and if they can check*/}
                                {this.state.betTurn && this.state.canCheck ?
                                    <div className='bet-turn'>
                                        <button onClick={() => this.fold()}>Fold</button>
                                        <button onClick={() => this.check()}>Check</button>
                                        <input
                                            type='number'
                                            onChange={(e) => this.setState({
                                                betAmount: e.target.value
                                            })} />
                                        <button onClick={() => this.setPreflopBetting()}>Bet</button>
                                        {/* Display messages for edge cases of not having enough money for certain actions */}
                                        {this.state.canCall ? null : <p>You do not have enough money to call. You will need to either fold or bet all of your money</p>}
                                        {this.state.enoughMoney ? null : <p>Sorry, this bet is not allowed</p>}
                                        {this.state.betAllowed ? null : <p>All bets must be at least 50, in increments of 25, and be at least double the last bet.</p>}
                                    </div> :
                                    // Checks if it is players turn to bet and if they cannot check
                                    this.state.betTurn ?
                                        <div className='bet-turn'>
                                            <button onClick={() => this.fold()}>Fold</button>
                                            <button onClick={() => this.callBet()}>Call</button>
                                            <input
                                                type='number'
                                                onChange={(e) => this.setState({
                                                    betAmount: e.target.value
                                                })} />
                                            <button onClick={() => this.setPreflopBetting()}>Raise</button>
                                            {this.state.canCall ? null : <p className='rule-reminder'>You do not have enough money to call. You will need to either fold or bet all of your money</p>}
                                            {this.state.enoughMoney ? null : <p className='rule-reminder'>Sorry, this bet is not allowed</p>}
                                            {this.state.betAllowed ? null : <p className='rule-reminder'>All bets must be at least 50, in increments of 25, and be at least double the last bet.</p>}
                                        </div> : null}
                                {this.state.winnerNames && this.state.player[0].pokerId !== 2 ?
                                    <div className='leave'>
                                        <h2>You may leave the game:</h2>
                                        <Link to='/homepage'>
                                            <button
                                                onClick={() => this.leaveGame()}
                                            >Leave</button>
                                        </Link>
                                    </div>
                                    : null}
                            </div> :
                            <p className='waiting'>Waiting on other players...</p>
                }
                <div className='board'>
                    {this.state.allPlayersJoined ?
                    <div className='deck'>
                        <img src='https://cdn.shopify.com/s/files/1/0200/7616/products/playing-cards-superior-classic-back-1_1024x1024.png?v=1530155531' alt='card back' />
                    </div> : null}
                    {/* Display flop once it has been sent to the frontend */}
                    {this.state.flop ?
                        <div className='flop-board'> {displayFlopImages(this.state.flop)} </div> : 
                        this.state.allPlayersJoined ?
                        <div className='flop-placeholder'></div> : null}
                    {/* Display turn once it has been sent to the frontend */}
                    {this.state.turn ?
                        <div className='turn-board'>{displayTurnAndRiver(this.state.turn)} </div> : 
                        this.state.allPlayersJoined ?
                        <div className='turn-placeholder'></div> : null}
                    {/* Display river once it has been sent to the frontend */}
                    {this.state.river ?
                        <div className='river'> {displayTurnAndRiver(this.state.river)} </div> : null}
                </div>
            </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { ...state }
}

export default connect(mapStateToProps, {})(GamePlay);