import React, {useState} from 'react';
import Search from '../../images/Vector.png';
import Back from '../../images/Vector 181.png';

class SelectComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search: ''
        }
    }
    
    render() {
        const {currencyList, handleCurChange, handleBackClick} = this.props;
        const handleChange = (e) => {
            this.setState({search: e.target.value});
        }
        
        const handleCurClick = (currency) => {
            handleCurChange(currency);
        }

        const onBackClick = () => {
            handleBackClick();
        }
        
        const filteredList = currencyList.filter(cur => cur.short_name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1);

        return (
            <div>
                <div className="searchCur">
                    <input onChange={handleChange} type="text" placeholder="SEARCH" />
                    <img src={Search} />
                </div>
                <div className="curList">
                    <ul>
                        {filteredList.map(cur => 
                            <li key={cur.short_name} onClick={() => handleCurClick(cur.short_name)}>
                                {cur.short_name}
                            </li>
                        )}
                    </ul>
                </div>
                <div>
                    <div className="back"><span onClick={onBackClick}><img src={Back} /> back</span></div>
                </div>
            </div>
        );
    }
}

export default SelectComponent;