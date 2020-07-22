import React from 'react';
import Search from '../../images/Vector.png';
import Back from '../../images/Vector 181.png';

class SelectComponent extends React.Component {
    render() {
        const {currencyList, handleCurChange, handleBackClick, onKeyDown, mouserOver, onSearchChange} = this.props;
        const handleChange = (e) => {
            onSearchChange(e.target.value);
        }
        
        const handleCurClick = (currency) => {
            handleCurChange(currency);
        }

        const onBackClick = () => {
            handleBackClick();
        }
        
        const { tempSelect, searchText } = this.props;

        return (
            <div onKeyDown={onKeyDown}>
                <div className="searchCur">
                    <input onChange={handleChange} value={searchText} id="searchInput" type="text" placeholder="SEARCH" />
                    <img src={Search} alt="search" />
                </div>
                <div className="curList">
                    <ul>
                        {currencyList.map((cur, index) => 
                            <li className={`${cur.short_name === tempSelect ? 'highlight' : ''}`} key={cur.short_name}
                                onClick={() => handleCurClick(cur.short_name)} onMouseOver={mouserOver}>
                                {cur.short_name}
                            </li>
                        )}
                    </ul>
                </div>
                <div>
                    <div className="back"><span onClick={onBackClick}><img src={Back} alt="back" /> back</span></div>
                </div>
            </div>
        );
    }
}

export default SelectComponent;