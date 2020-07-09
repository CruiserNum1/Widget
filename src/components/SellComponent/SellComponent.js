import React from 'react';
import axios from 'axios';
import SelectComponent from '../SelectComponent/SelectComponent';
import {
    ConvertAmount, ConvertAmountOut, PaymentForm, GetCurrencies, CheckAddress
} from '../../constants';
import { luhn } from '../../luhn';

class SellComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curIn: '600',
            curOut: '0',
            selectIn: 'USD',
            selectOut: 'BTC',
            currencyList: [],
            walletAddress: '',
            email: '',
            cardNumber: '',
            cardDate: '',
            cvc: '',
            name: '',
            stage: 1,
            errors: {
                email: {
                    isValid: false,
                    errorText: ''
                },
                walletAddress: {
                    isValid: false,
                    errorText: ''
                },
                isValidCardNumber: false,
                isValidCardDate: false,
                isValidCVC: false
            }
        };
    }

    componentWillMount() {
        axios.get(GetCurrencies)
            .then(res =>
            {
                this.setState({ currencyList: res.data.result });
            });

        axios.get(ConvertAmount + this.state.selectIn + '/' + this.state.selectOut + '/' + this.state.curIn)
            .then(res =>
            {
                this.setState({ curOut: res.data });
            });
    }

    componentDidMount() {
        document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
    }

    render() {
        const handleChange = (e) => {
            this.setState({
                [e.target.name]: e.target.value
            });
        }

        const handleCardDateChange = (e) => {
            var target = e.target.value;
            var firstNum = target.replace(' / ', '').substring(0, 1);
            var month;
            if (firstNum > 1 && firstNum < 10)
                month = '0' + target.replace(' / ', '').substring(0, 1);
            else
                month = target.replace(' / ', '').substring(0, 2);
            var year = target.replace(' / ', '').substring(2, 4);
            if (month.length === 2) {
                if (target.length === 5)
                    e.target.value = month;
                else if (target.length === 4)
                    e.target.value = month.substring(0, 1);
                else
                    e.target.value = month + ' / ' + year;
            }
            var curDate = new Date();
            var isBiggerThanCurDate = parseInt(year) > parseInt(curDate.getFullYear().toString().substring(2, 4));
            var isSameWithCurDate = parseInt(year) === parseInt(curDate.getFullYear().toString().substring(2, 4));
            var errors = this.state.errors;
            if (isBiggerThanCurDate || (parseInt(month) >= parseInt(curDate.getMonth() + 1) && isSameWithCurDate)) {
                errors.isValidCardDate = true;
                document.getElementById("cvc").focus();
            }
            else
                errors.isValidCardDate = false;
            
            this.setState({ errors });
        }

        const handleCardNumberChange = (e) => {
            var target = e.target.value.trim();
            var formattedNumber = cardNumberFormat(target);
            e.target.value = formattedNumber;
            var errors = this.state.errors;
            if (luhn(target)) {
                errors.isValidCardNumber = true;
                document.getElementById("cardDate").focus();
            }
            else
                errors.isValidCardNumber = false;
            
            this.setState({ errors });
        }

        const cardNumberFormat = (value) => {
            var v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            var matches = v.match(/\d{4,16}/g);
            var match = matches && matches[0] || '';
            var parts = [];

            for (let i=0, len=match.length; i<len; i+=4) {
                parts.push(match.substring(i, i+4));
            }

            if (parts.length) {
                return parts.join(' ');
            } else {
                return value;
            }
        }

        const handleCVCChange = (e) => {
            handleChange(e);
            var errors = this.state.errors;
            if (e.target.value.length === 3) {
                errors.isValidCVC = true;
                document.getElementById("cardName").focus();
            }
            else
                errors.isValidCVC = false;

            this.setState({ errors });
        }

        const handleButtonClickS1 = () => {
            if (this.state.curIn === '' || this.state.curOut === '')
                return;
            this.setState(prevState => ({ stage: prevState.stage++ }));
            this.props.navbarShow();
            document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
        }

        const handleButtonClickS2 = () => {
            var errors = this.state.errors;
            if (!errors.isValidCardNumber || !errors.isValidCardDate || !errors.isValidCVC || this.state.name.length === 0)
                return;
            document.getElementById("stages").style.height = document.getElementById("stageThree").clientHeight + 'px';
            this.setState(prevState => ({ stage: prevState.stage++ }));
        }

        const handleButtonClickS3 = async () => {
            let errorsEmail = this.state.errors.email;
            let errorsAddress = this.state.errors.walletAddress;
            
            if (this.state.email === '') {
                errorsEmail.errorText = 'Required field';
                await this.setState({ errorsEmail });
                document.getElementById("stages").style.height = document.getElementById("stageThree").clientHeight + 'px';
            }

            if (this.state.walletAddress === '') {
                errorsAddress.errorText = 'Required field';
                await this.setState({ errorsAddress });
                document.getElementById("stages").style.height = document.getElementById("stageThree").clientHeight + 'px';
                return;
            }

            if (!errorsEmail.isValid)
                return;

            // check wallet address
            var arr = {
                address: this.state.walletAddress,
                currency: "BTC"
            };
            var result = await axios.post(CheckAddress, arr)
                 .then(res => res.data.result);

            if (result === 'not_valid') {
                errorsAddress.errorText = 'Invalid address';
                await this.setState({ errorsAddress });
                document.getElementById("stages").style.height = document.getElementById("stageThree").clientHeight + 'px';
                return;
            }

            // this.setState(prevState => ({ stage: prevState.stage++ }));
        }

        const handleCurInput = async (e) => {
            var name = e.target.name;
            const URL = name === 'curIn' ? ConvertAmount : ConvertAmountOut;
            await handleChange(e);
            const convertFrom = this.state.selectIn;
            const convertTo = this.state.selectOut;
            const InputName = name === 'curIn' ? 'curOut' : 'curIn';
            const amount = name === 'curIn' ? this.state.curIn : this.state.curOut;

            await axios.get(URL + `${convertFrom}/${convertTo}/${amount}`)
                .then(async res => {
                    if (res.data === 0.0)
                    {
                        await this.setState({
                            curOut: ''
                        });
                    }
                    else
                    {
                        await this.setState({
                            [InputName]: res.data
                        })
                    }
                });
        }

        const handleCurChange = async (currency) => {
            document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
            this.props.navbarShow();
            await this.setState({ stage: 1, [this.state.selectFor]: currency });
            const convertFrom = this.state.selectIn;
            const convertTo = this.state.selectOut;
            const amount = this.state.curIn;

            await axios.get(ConvertAmount + `${convertFrom}/${convertTo}/${amount}`)
                .then(async res => {
                    await this.setState({
                        curOut: res.data
                    })
                });
        }

        const handleBackClick = () => {
            this.props.navbarShow();
            this.setState({ stage: 1 });
            document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
        }

        const validEmailRegex = RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);
        const handleEmailInput = async (e) => {
            const value = e.target.value;
            let emailErrors = this.state.errors.email;
            await handleChange(e);
            if (value === '') {
                emailErrors.errorText = 'Required field';
                emailErrors.isValid = false;
                this.setState({
                    emailErrors
                });
                return;
            }
            if (validEmailRegex.test(value)) {
                emailErrors.isValid = true;
                emailErrors.errorText = '';
            }
            else {
                emailErrors.isValid = false;
                emailErrors.errorText = 'Incorrect email';
            }
            this.setState({
                emailErrors
            });
        }

        const handleAddressInput = async (e) => {
            const value = e.target.value;
            let addressErrors = this.state.errors.walletAddress;
            await handleChange(e);
            addressErrors.errorText = value === ''
                                        ? 'Required field'
                                        : '';
            this.setState({
                    addressErrors
                });
        }

        const selectInCurrencies = this.state.currencyList.filter(cur => !cur.withdrawEnabled);
        const selectOutCurrencies = this.state.currencyList.filter(cur => cur.withdrawEnabled);

        return (
            <div id="stages">
                <div id="stageOne" className={`form ${this.state.stage === 1 ? "center" : "left"}`}>
                    <div className="currencies">
                        <input placeholder="YOU GIVE" type="number" value={this.state.curIn} name="curIn" onChange={handleCurInput} />
                        {/* <select name="selectIn" value={this.state.selectIn} onChange={handleChangeSelect} onClick={handleSelectClick}>
                            <option>USD</option>
                        </select> */}
                        <div onClick={() => {
                                this.setState({stage: 'selectCur', selectFor: 'selectIn'});
                                this.props.navbarShow();
                                document.getElementById("stages").style.height = document.getElementById("stageSelect").clientHeight + 'px';
                            }}>
                            {this.state.selectIn}
                        </div>
                    </div>
                    <div className="currencies">
                        <input placeholder="YOU GET" type="number" value={this.state.curOut} name="curOut" onChange={handleCurInput} />
                        {/* <select name="selectOut" value={this.state.selectOut} onChange={handleChangeSelect} onClick={handleSelectClick}>
                            <option>BTC</option>
                        </select> */}
                        <div onClick={() => {
                                this.setState({stage: 'selectCur', selectFor: 'selectOut'});
                                this.props.navbarShow();
                                document.getElementById("stages").style.height = document.getElementById("stageSelect").clientHeight + 'px';
                            }}>
                            {this.state.selectOut}
                        </div>
                    </div>
                    {this.state.curOut === '' && 
                        <span className="details">This pair is temporarily unavailable or amount is too small</span>
                    }

                    <button onClick={handleButtonClickS1}>Continue</button>
                </div>

                <div id="stageTwo" className={`form ${this.state.stage === 2 ? "center" : this.state.stage === 1 ? "right" : "left"}`}>
                    <input className={`${this.state.errors.isValidCardNumber ? "" : "notValidInput"}`} placeholder="ENTER CARD NUMBER" name="cardNumber" type="text" onChange={handleCardNumberChange} />
                    <div className="cardInfo">
                        <input className={`${this.state.errors.isValidCardDate ? "" : "notValidInput"}`} placeholder="MM/YY" name="cardDate" id="cardDate" type="text" onChange={handleCardDateChange} />
                        <input className={`${this.state.errors.isValidCVC ? "" : "notValidInput"}`} placeholder="CVC" maxLength="3" name="cvc" id="cvc" type="text" onChange={handleCVCChange} />
                    </div>
                    <input placeholder="NAME ON CARD" name="name" id="cardName" type="text" onChange={handleChange} />
                    
                    <button onClick={handleButtonClickS2}>Continue</button>
                </div>

                <div id="stageThree" className={`form ${this.state.stage === 3 ? "center" : "right"}`}>
                    <input placeholder="CRYPTO WALLET ADDRESS" name="walletAddress" type="text" onChange={handleAddressInput} />
                    <span className="details">{this.state.errors.walletAddress.errorText}</span>
                    <input placeholder="EMAIL" name="email" type="text" onChange={handleEmailInput} />
                    <span className="details">{this.state.errors.email.errorText}</span>

                    <button onClick={handleButtonClickS3}>Buy</button>
                </div>

                <div id="stageSelect" className={`form selectCur ${this.state.stage === 'selectCur' ? "centerCur" : "right"}`}>
                    <SelectComponent handleCurChange={handleCurChange} handleBackClick={handleBackClick} currencyList={this.state.selectFor === 'selectIn' ? selectInCurrencies : selectOutCurrencies} />
                </div>
            </div>
        );
    }
}

export default SellComponent;