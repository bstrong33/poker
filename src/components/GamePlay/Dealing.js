import React, { Component } from 'react';
import { connect } from 'react-redux'

class Dealing extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            players: ''
        }
    }
    

    render() {
        return (
            <div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {...state}
}

export default connect(mapStateToProps, {})(Dealing);