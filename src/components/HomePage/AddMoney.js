import React, { Component } from 'react';
import { connect } from 'react-redux'
import { updateInitialMoney } from './../../ducks/reducer';

class AddMoney extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            input: '',
            buyIn: 0,
        }
    }

    BuyIn = () => {
        if (this.state.input >= 500 && this.state.input <= 2000 && this.state.input % 50 === 0) {
            this.setState({
                buyIn: this.state.input
            })
            this.props.updateInitialMoney(this.state.input)
        }
    }
    

    render() {
        return (
            <div className='inner-money-div'>
                <h2>Buy-in Amount</h2>
                <p>Must be between $500-$2000</p>
                <p>Must be in increments of $50</p>
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

function mapStateToProps(state) {
    return {...state}
}

export default connect(mapStateToProps, {updateInitialMoney})(AddMoney);