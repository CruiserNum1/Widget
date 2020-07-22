const initialState = {
    buyComponent: {
        curIn: '600',
        selectIn: 'USD',
        selectOut: 'BTC'
    },
    sellComponent: {
        curIn: '600',
        selectIn: 'USD',
        selectOut: 'BTC'
    },
    exchangeComponent: {
        curIn: '600',
        selectIn: 'USD',
        selectOut: 'BTC'
    }
}

const changeState = (state = initialState, action) => {
    switch(action.type) {
        case 'BUY_COMPONENT_STATE':
            return Object.assign({}, state, {
                buyComponent: action.payload 
            });
        case 'SELL_COMPONENT_STATE':
            return Object.assign({}, state, {
                sellComponent: action.payload
            });
        case 'EXCHANGE_COMPONENT_STATE':
            return Object.assign({}, state, {
                exchangeComponent: action.payload
            });
        default:
            return state;
    }
}

export default changeState;