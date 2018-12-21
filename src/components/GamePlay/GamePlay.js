import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';

class GamePlay extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            ready: false,
            player: [],
            otherPlayers: [],
            room: '',
            joined: false,
            joinPressed: false,
            allPlayersJoined: false,
            betAmount: 0,
            betTurn: false,
            canCheck: false,
            flop: null,
            turn: null,
            river: null,
            potTotal: 75,
        }
    }
    
    // Initilizing socket connection, room, and dealing
    componentDidMount() {
        let { username, id, initialMoney} = this.props
        let startMoney = parseInt(initialMoney);
        this.socket = io();
        this.socket.on('room joined', data => {
            this.joinSuccess()
        })
        this.socket.emit('join game', {username, id, startMoney})
        this.socket.on('dealt out', this.viewCards)
        this.socket.on('preflop betting', this.allowPreflopBetting)
        this.socket.on('flop', this.setFlop)
        this.socket.on('turn', this.setTurn)
        this.socket.on('river', this.setRiver)
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

    joinSuccess = () => {
        this.setState({
            joined: true
        })
    }

    // Becoming ready to play so dealing can begin
    readyToPlay = () => {
        this.setState({
            ready: true
        })
        this.socket.emit('ready', {room: this.state.room})
    }

    // recieiving cards from server and setting state to be able to display these cards
    viewCards = players => {
        let otherPlayers = []
        for (let i = 0; i < players.length; i++) {
            if (players[i].id === this.props.id) {
                const updatedPlayerHand = []
                updatedPlayerHand.push(players[i])
                this.setState({player: updatedPlayerHand})
            } 
            else {
                otherPlayers.push(players[i])
            }
        }
        this.setState({otherPlayers, allPlayersJoined: true})
    }

    // Preflop Betting
    allowPreflopBetting = data => {
        let { playersInHand, potTotal } = data
        let otherPlayers = []
        for (let i = 0; i < playersInHand.length; i++) {
            // if it is the players turn to bet (sent from server), then betTurn will be true which triggers a ternary in the render
            if (playersInHand[i].id === this.props.id && playersInHand[i].betTurn === true) {

                let playersToSort = [...playersInHand];
                let highestBet = playersToSort.sort( (a, b) => {
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
        this.setState({otherPlayers, potTotal})
    }

    setPreflopBetting = () => {
        let { betAmount } = this.state;

        // Spreading player from state so it can be edited
        let player = [...this.state.player];

        // Adding the amount betted to the total bet
        player[0].bet += parseInt(betAmount);

        // Decreasing money by amount betted
        let bettedAmount = parseInt(betAmount);
        player[0].startMoney -= bettedAmount

        // Changing status so it is no longer set to allow betting in the player object
        player[0].betTurn = false

        this.setState({
            betTurn: false,
            player
        }, () => this.displayPreflopBetting())
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
        let highestBet = sortedOtherPlayers.sort( (a, b) => {
            return b.bet - a.bet
        })[0]
        console.log(highestBet)

        let player = [...this.state.player];
        let { bet } = player[0];

        // startMoney only changes by the amount being called while still displaying the total amount of money bet
        let callAmount = highestBet.bet - bet
        player[0].bet = highestBet.bet
        player[0].startMoney -= callAmount
        player[0].betTurn = false;

        this.setState({
            betTurn: false,
            player
        }, () => this.displayPreflopBetting())
    }

    // check
    check = () => {

        let player = [...this.state.player]
        player[0].betTurn = false

        this.setState({
            betTurn: false,
            player
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
            player
        }, () => this.displayPreflopBetting())
    }

    // recieve flop (or turn or river) from server and set state to display the flop
    setFlop = flop => {
        this.setState({flop}, () => this.displayflopBetting())
    }
    
    setTurn = turn => {
        this.setState({turn}, () => this.displayTurnBetting())
    }
    
    setRiver = river => {
        this.setState({river}, () => this.displayRiverBetting())
    }

    render() {
        let mappedOtherPlayers = this.state.otherPlayers.map(player => {
            return (
                <div key='player.id'>
                    <p>Username: {player.username}</p>
                    <p>Money: {player.startMoney}</p>
                    <p>{['blank ', 'blank']}</p>
                    <p>Bet: {player.bet}</p>
                </div>
            )
        })
        return (
            <div>
                 {/* When a room has been joined the room name will display  */}
                {this.state.joined ? <h1> My Room: {this.state.room}</h1> : null}


                {/* When a room has been joined then the player can ready up. After all players are ready, cards can be displayed */}
                {this.state.joinPressed === false ? 
                <div>
                    <input value={this.state.room} onChange={e => {
                        this.setState({
                            room: e.target.value
                        })
                    }} />
                    <button onClick={this.joinRoom}>Join</button>
                </div>:
                    // Checks if all players including self has indicated they are ready to play
                    this.state.ready === false ?
                    <button onClick={() => this.readyToPlay()}>Ready</button> : 
                    this.state.allPlayersJoined ?
                    <div>
                    {/* Displays pot total as it changes */}
                    <p>Pot Total: {this.state.potTotal}</p>
                    <p>Username: {this.state.player[0].username}</p>
                    <p>Money: {this.state.player[0].startMoney}</p>
                    <p>Cards: {this.state.player[0].cards}</p>
                    <p>Bet: {this.state.player[0].bet}</p>
                    {/* PreFlop betting ternary, checks if it is players turn to bet and if they can check*/}
                        {this.state.betTurn && this.state.canCheck ?
                        <div>
                            <button onClick={() => this.fold()}>Fold</button>
                            <button onClick={() => this.check()}>Check</button>
                            <input 
                                type='number'
                                onChange={(e) => this.setState({betAmount: e.target.value})}/>
                            <button onClick={() => this.setPreflopBetting()}>Bet</button>
                        </div> : 
                        // Checks if it is players turn to bet and if they cannot check
                        this.state.betTurn ? 
                        <div>
                            <button onClick={() => this.fold()}>Fold</button>
                            <button onClick={() => this.callBet()}>Call</button>
                            <input 
                                type='number'
                                onChange={(e) => this.setState({betAmount: e.target.value})}/>
                            <button onClick={() => this.setPreflopBetting()}>Bet</button>
                        </div>: null}
                    {mappedOtherPlayers}
                    </div> :
                    <p>Waiting on other players...</p>
                }
                {/* Display flop once it has been sent to the frontend */}
                {this.state.flop ? <p>FLOP: {this.state.flop}</p>: null}
                {/* Display turn once it has been sent to the frontend */}
                {this.state.turn ? <p>TURN: {this.state.turn}</p>: null}
                {/* Display river once it has been sent to the frontend */}
                {this.state.river ? <p>RIVER: {this.state.river}</p>: null}

                
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {...state}
}

export default connect(mapStateToProps, {})(GamePlay);