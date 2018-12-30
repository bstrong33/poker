import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Personal extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            canDelete: false
        }
    }
    
    deleteAccount = (id) => {
        if (this.state.canDelete === true){
            axios.delete(`/api/delete/${id}`)
        } else {
            this.setState({
                canDelete: true,
            })

        }
    }

    render() {
        return (
            <div className='personal-background'>
                <div>
                 {
                    this.state.canDelete ?
                    <div>
                        <Link to='/'>
                            <button onClick={() => this.deleteAccount(this.props.id)}>Delete Account</button>
                        </Link> 
                        <p>Careful, deleting an account is permanent!</p>
                    </div> :
                    <button onClick={() => this.deleteAccount()}>Delete Account</button>
                }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {...state}
}

export default connect(mapStateToProps, {})(Personal);