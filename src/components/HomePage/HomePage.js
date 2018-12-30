import React, { Component } from 'react';
import Leaderboard from './Leaderboard';
import AddMoney from './AddMoney';
import JoinGame from './JoinGame';
import { Link } from 'react-router-dom';

class HomePage extends Component { 

    render() {
        return (
            <div className='homepage-background'>
                <div className='leaderboard'>
                    <h2>Leaderboard</h2>
                    <Leaderboard />
                </div>
                <div className='money-and-game'>
                    <div className='view-account'>
                        <h2>View Account</h2>
                        <Link to='/personal'><button>View</button></Link>
                    </div>
                    <div className='add-money'>
                        <AddMoney />
                    </div>
                    <div className='join-game'>
                        <h2>Join Game</h2>
                        <JoinGame />
                    </div>
                </div>
            </div>
        );
    }
}

export default HomePage;