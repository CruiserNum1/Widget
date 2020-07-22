import React from 'react';
import './index.css';
import BuyComponent from '../BuyComponent/BuyComponent';
import SellComponent from '../SellComponent/SellComponent';
import ExchangeComponent from '../ExchangeComponent/ExchangeComponent';
import { connect } from 'react-redux';

class WidgetForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            type: 'Buy',
            navbarShow: true,
            currency: ''
        };
    }

    render() {
        const onChangeIsShow = async () => {
            this.props.handleIsShow();
            await this.setState({ type: "Exchange" });
            await this.setState({ type: 'Buy', navbarShow: true });
        }

        const handleTypeChange = (type) => {
            this.setState({ type: type });
        }

        const handleNavbarShow = () => {
            this.setState(prevState => ({ navbarShow: !prevState.navbarShow }));
        }

        const handleCurrencyChange = (currency) => {
            this.setState({ currency: currency });
        }

        const handleChangeType = (action) => {
            this.props.dispatch(action);
        }

        const { isShow } = this.props;
        const { currency } = this.state;
        const text = this.state.type === "Exchange" ? `Exchange ${currency}` : `${this.state.type} ${currency} with bank card`;

        return (
            <div className={`card ${!isShow ? "" : "show"}`}>
                <div className="hide" onClick={onChangeIsShow}>
                    <svg color="inherit" viewBox="0 0 32 32" aria-hidden="true"><path d="M11,22c-0.6,0-1-0.4-1-1s0.4-1,1-1h15c0.6,0,1,0.4,1,1s-0.4,1-1,1H11z"></path></svg>
                    <span className="tooltiptext">Minimize window</span>
                </div>
                <div className="clearfix"></div>
                <div className="card-header">
                    <svg width="165" height="22" viewBox="0 0 106 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M85.9995 14.5508V1.1221" stroke="#151515" strokeWidth="3.5"/>
                        <path d="M91.7866 14.5737V3.98009C91.7876 3.75979 91.8549 3.54487 91.98 3.36337C92.105 3.18187 92.2819 3.04221 92.4876 2.96261C92.6933 2.883 92.9182 2.86714 93.133 2.91709C93.3479 2.96704 93.5427 3.08049 93.692 3.24265L102.092 12.4761C102.241 12.6399 102.436 12.7548 102.651 12.8058C102.867 12.8567 103.093 12.8412 103.299 12.7614C103.506 12.6816 103.683 12.5411 103.809 12.3585C103.934 12.176 104 11.9598 104 11.7386V1.14499" stroke="#151515" strokeWidth="3.5"/>
                        <path d="M2 14.5508V1.1221" stroke="#151515" strokeWidth="3.5"/>
                        <path d="M7.79492 14.5508V3.9572C7.79497 3.73602 7.86202 3.52002 7.98726 3.3376C8.11249 3.15517 8.29005 3.01485 8.49661 2.93507C8.70317 2.8553 8.92906 2.83979 9.14461 2.8906C9.36015 2.94141 9.55526 3.05616 9.70431 3.21976L18.1043 12.4532C18.2531 12.617 18.4481 12.7319 18.6637 12.7829C18.8792 12.8338 19.1052 12.8183 19.3117 12.7385C19.5183 12.6587 19.6958 12.5182 19.8209 12.3356C19.9459 12.1531 20.0127 11.9369 20.0123 11.7157V1.1221" stroke="#151515" strokeWidth="3.5"/>
                        <path d="M25.4375 13.0879V2.52896H31.0308C31.725 2.52879 32.4125 2.66522 33.0539 2.93048C33.6954 3.19574 34.2782 3.58461 34.7691 4.07489C35.26 4.56518 35.6494 5.14725 35.915 5.78787C36.1806 6.42848 36.3172 7.11508 36.317 7.80844C36.317 9.20865 35.7601 10.5515 34.7687 11.5416C33.7773 12.5317 32.4328 13.0879 31.0308 13.0879H25.4375Z" stroke="#151515" strokeWidth="3.5"/>
                        <path d="M66.9552 2.52896H60.5167C59.1147 2.52896 57.7701 3.08519 56.7788 4.07529C55.7874 5.06538 55.2305 6.40824 55.2305 7.80844V7.80844C55.2308 9.20854 55.7879 10.5512 56.7791 11.5412C57.7704 12.5312 59.1148 13.0876 60.5167 13.0879H66.9552" stroke="#46B2D1" strokeWidth="3.5"/>
                        <path d="M68.5693 13.1159H75.0065C75.701 13.1159 76.3888 12.9792 77.0304 12.7137C77.672 12.4481 78.2549 12.0588 78.7458 11.5682C79.2367 11.0775 79.626 10.495 79.8915 9.85403C80.1569 9.21303 80.2932 8.52607 80.2927 7.83243V7.83243C80.292 6.43281 79.7347 5.09077 78.7434 4.10147C77.7521 3.11216 76.4079 2.55659 75.0065 2.55695H68.5693" stroke="#46B2D1" strokeWidth="3.5"/>
                        <path d="M54.0275 14.8922L47.9548 2.32627C46.9053 0.155267 43.7916 0.200607 42.8075 2.40361L37.2275 14.8922H41.5123L45.6595 5.73879L47.3406 9.6994H45.2496L43.8209 12.8999H48.7025L49.5491 14.8922H54.0275Z" fill="#151515"/>
                    </svg>
                    <span className="header-text">{text}<br /><span style={{ color: "#6B6B6B", fontWeight: "600", fontFamily: "Gilroy-Bold" }}>In partnership with Name company</span></span>
                </div>
                <div className="card-body">
                    {this.state.navbarShow && 
                        <div className="navbar">
                            <ul>
                                <li className={this.state.type === 'Buy' ? "active" : ""} onClick={() => handleTypeChange('Buy')}>BUY</li>
                                <li className={this.state.type === 'Sell' ? "active" : ""} onClick={() => handleTypeChange('Sell')}>SELL</li>
                                <li className={this.state.type === 'Exchange' ? "active" : ""} onClick={() => handleTypeChange('Exchange')}>EXCHANGE</li>
                            </ul>
                        </div>
                    }
                    
                    {this.state.type === 'Buy' ?
                        <BuyComponent navbarShow={handleNavbarShow} onCurrencyChange={handleCurrencyChange} onChangeType={handleChangeType} /> :
                        this.state.type === 'Sell' ?
                            <SellComponent navbarShow={handleNavbarShow} onCurrencyChange={handleCurrencyChange} onChangeType={handleChangeType} /> :
                            <ExchangeComponent navbarShow={handleNavbarShow} onCurrencyChange={handleCurrencyChange} onChangeType={handleChangeType} />
                    }
                </div>
            </div>
        );
    }
}

WidgetForm = connect()(WidgetForm);

export default WidgetForm;