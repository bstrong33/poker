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
            betTurn: false
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
    allowPreflopBetting = players => {
        let otherPlayers = []
        for (let i = 0; i < players.length; i++) {
            if (players[i].id === this.props.id && players[i].betTurn === true) {
                this.setState({
                    betTurn: true,
                })
            } 
            if (players[i].id === this.props.id) {
                const updatedPlayerHand = []
                updatedPlayerHand.push(players[i])
                this.setState({
                    player: updatedPlayerHand
                })
            }
            else {
                otherPlayers.push(players[i])
                }
        }
        this.setState({otherPlayers})
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
                    this.state.ready === false ?
                    <button onClick={() => this.readyToPlay()}>Ready</button> : 
                    this.state.allPlayersJoined ?
                    <div>
                    <p>Username: {this.state.player[0].username}</p>
                    <p>Money: {this.state.player[0].startMoney}</p>
                    <p>Cards: {this.state.player[0].cards}</p>
                    <p>Bet: {this.state.player[0].bet}</p>
                    {/* PreFlop betting ternary*/}
                        {this.state.betTurn ?
                        <div>
                            <input 
                                type='number'
                                onChange={(e) => this.setState({betAmount: e.target.value})}/>
                            <button onClick={() => this.setPreflopBetting()}>Bet</button>
                        </div> : null}
                    {mappedOtherPlayers}
                    </div> :
                    <p>Waiting on other players...</p>
                }

                
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {...state}
}

export default connect(mapStateToProps, {})(GamePlay);