import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Personal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            canDelete: false,
            stats: [0],
            moneyPerGame: 0
        }
    }

    componentDidMount() {
        let { id } = this.props
        axios.get(`/api/personal/${id}`).then(res => {
            if (res.data[0].money_won[0] === '-') {
                let newMoneyWon = 0 - parseInt(res.data[0].money_won.replace('-$', '').replace(',', '').replace(',', ''))
                let gamesPlayed = parseInt(res.data[0].games_played)
                let moneyPerGame = newMoneyWon / gamesPlayed
                this.setState({
                    stats: res.data,
                    moneyPerGame
                })
            } else {
                let newMoneyWon = parseInt(res.data[0].money_won.replace('$', '').replace(',', '').replace(',', ''))
                let gamesPlayed = parseInt(res.data[0].games_played)
                let moneyPerGame = newMoneyWon / gamesPlayed
                if (gamesPlayed === 0) {
                    moneyPerGame = 0
                }
                this.setState({
                    stats: res.data,
                    moneyPerGame
                })
            }
        })
    }

    deleteAccount = (id) => {
        if (this.state.canDelete === true) {
            axios.delete(`/api/delete/${id}`)
        } else {
            this.setState({
                canDelete: true,
            })

        }
    }

    render() {
        let { stats, moneyPerGame } = this.state
        return (
            <div className='personal-background'>
                <div className='pstats'>
                <h2>Your Stats</h2>
                <div className='pgrid'>
                    <span>Username:</span>
                    <span>Games Played:</span>
                    <span>Total Money Won::</span>
                    <span>Money Won Per Game:</span>
                    <span>{stats[0].username}</span>
                    <span>{stats[0].games_played}</span>
                    <span>{stats[0].money_won}</span>
                    <span>{moneyPerGame}</span>
                </div>
                </div>
                <div className='back-and-delete'>
                    <div className='back-to-homepage'>
                        <h4>Back to Homepage</h4>
                        <Link to='/homepage'>
                            <button>Homepage</button>
                        </Link>
                    </div>
                    <div className='delete'>
                    {
                        this.state.canDelete ?
                            <div className='delete-inside'>
                                <h4>Delete Account</h4>
                                <Link to='/'>
                                    <button onClick={() => this.deleteAccount(this.props.id)}>Delete</button>
                                </Link>
                                <p>Careful, deleting an account is permanent!</p>
                            </div> :
                            <div className='delete-inside'>
                            <h4>Delete Account</h4>
                            <button onClick={() => this.deleteAccount()}>Delete</button>
                            </div>
                    }
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { ...state }
}

export default connect(mapStateToProps, {})(Personal);