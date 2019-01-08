import React, { Component } from 'react';
import axios from 'axios';

class Leaderboard extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            leaderboard: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        }
    }

    componentDidMount() {
        axios.get('/api/leaderboard').then( res => {
            let leaderboard = res.data
            leaderboard.forEach((leader, i, arr) => {
                let newMoneyWon = parseInt(res.data[i].money_won.replace('$', '').replace(',', '').replace(',', ''))
                let gamesPlayed = parseInt(res.data[i].games_played)
                let moneyPerGame = newMoneyWon/gamesPlayed
                arr[i].money_per_game = moneyPerGame
            })
            this.setState({
                leaderboard: res.data
            })
        })
    }
    

    render() {
        let {leaderboard} = this.state
        // let mappedLeaderboard = leaderboard.map((leader, i) => {
        //     return (
        //         <div key={leader.id} className='grid'>
        //             {i === 0 ? <span>Username:</span> : null}
        //             {i === 0 ? <span>Games Played:</span> : null}
        //             {i === 0 ? <span>Total Money Won:</span> : null}
        //             {i === 0 ? <span>Money Won Per Game:</span> : null}
        //             <span>{leader.username}</span>
        //             <span>{leader.games_played}</span>
        //             <span>{leader.money_won}</span>
        //             <span>{leader.money_per_game}</span>
        //         </div> 
        //     )
        // })
        return (
            // {mappedLeaderboard}
            <div className='grid'>
                {/* <h2>Leaderboard</h2> */}
                <span>Username:</span>
                <span>Games Played:</span>
                <span>Total Money Won:</span>
                <span>Money Won Per Game:</span>
                <span>{leaderboard[0].username}</span>
                <span>{leaderboard[0].games_played}</span>
                <span>{leaderboard[0].money_won}</span>
                <span>${leaderboard[0].money_per_game}</span>
                <span>{leaderboard[1].username}</span>
                <span>{leaderboard[1].games_played}</span>
                <span>{leaderboard[1].money_won}</span>
                <span>${leaderboard[1].money_per_game}</span>
                <span>{leaderboard[2].username}</span>
                <span>{leaderboard[2].games_played}</span>
                <span>{leaderboard[2].money_won}</span>
                <span>${leaderboard[2].money_per_game}</span>
                <span>{leaderboard[3].username}</span>
                <span>{leaderboard[3].games_played}</span>
                <span>{leaderboard[3].money_won}</span>
                <span>${leaderboard[3].money_per_game}</span>
                <span>{leaderboard[4].username}</span>
                <span>{leaderboard[4].games_played}</span>
                <span>{leaderboard[4].money_won}</span>
                <span>${leaderboard[4].money_per_game}</span>
                <span>{leaderboard[5].username}</span>
                <span>{leaderboard[5].games_played}</span>
                <span>{leaderboard[5].money_won}</span>
                <span>${leaderboard[5].money_per_game}</span>
                <span>{leaderboard[6].username}</span>
                <span>{leaderboard[6].games_played}</span>
                <span>{leaderboard[6].money_won}</span>
                <span>${leaderboard[6].money_per_game}</span>
                <span>{leaderboard[7].username}</span>
                <span>{leaderboard[7].games_played}</span>
                <span>{leaderboard[7].money_won}</span>
                <span>${leaderboard[7].money_per_game}</span>
                <span>{leaderboard[8].username}</span>
                <span>{leaderboard[8].games_played}</span>
                <span>{leaderboard[8].money_won}</span>
                <span>${leaderboard[8].money_per_game}</span>
                <span>{leaderboard[9].username}</span>
                <span>{leaderboard[9].games_played}</span>
                <span>{leaderboard[9].money_won}</span>
                <span>${leaderboard[9].money_per_game}</span>
            </div>
        );
    }
}

export default Leaderboard;