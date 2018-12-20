const initialState = {
    username: '',
    id: '',
    initialMoney: '',
    endingMoney: ''
}

const UPDATE_USERNAME = 'UPDATE_USERNAME'
const UPDATE_ID = 'UPDATE_ID'
const UPDATE_INITIAL_MONEY = 'UPDATE_INITIAL_MONEY'

export function updateUsername (username) {
    return {
        type: UPDATE_USERNAME,
        payload: username
    }
}

export function updateId (id) {
    return {
        type: UPDATE_ID,
        payload: id
    }
}

export function updateInitialMoney (initialMoney) {
    return {
        type: UPDATE_INITIAL_MONEY,
        payload: initialMoney
    }
}

export default function reducer(state=initialState, action) {
    switch(action.type) {
        case UPDATE_USERNAME:
            return {...state, username: action.payload}

        case UPDATE_ID:
            return {...state, id: action.payload}

        case UPDATE_INITIAL_MONEY:
            return {...state, initialMoney: action.payload}

        default:
            return state;
    }
}