import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class JoinGame extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            message: '',
        }
    }
    

    BuyInMessage = () => {
        this.setState({
            message: 'You must buy-in to join a game'
        })
    }

    render() {
        return (
            <div>
                {this.props.initialMoney !== '' ?
                    <Link to='/gameplay'>
                        <button>Join</button>
                    </Link> :
                    <div>
                        <button onClick={() => this.BuyInMessage()}>Join</button>
                        <p>{this.state.message}</p>
                    </div>
                }
                    
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {...state}
}

export default connect(mapStateToProps, {})(JoinGame);