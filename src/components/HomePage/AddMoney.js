import React, { Component } from 'react';

class AddMoney extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            input: '',
            buyIn: 0.00,
        }
    }

    BuyIn = () => {
        if (this.state.input >= 5.00 && this.state.input <= 20.00) {
            this.setState({
                buyIn: this.state.input
            })
        }
    }
    

    render() {
        return (
            <div className='inner-money-div'>
                <h2>Buy-in Amount</h2>
                <p>Must be between $5-$20</p>
                <input
                    type='number'
                    onChange={e => this.setState({ input: e.target.value })}
                />
                <button onClick={e => this.BuyIn(e.target.value)}>Buy-in</button>
                <p>{`You will be buying in for $${this.state.buyIn}`}</p>
            </div>
        );
    }
}

export default AddMoney;