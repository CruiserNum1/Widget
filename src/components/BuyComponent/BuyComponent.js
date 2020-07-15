import React from 'react';
import axios from 'axios';
import SelectComponent from '../SelectComponent/SelectComponent';
import {
    ConvertAmount, ConvertAmountOut, GetCurrencies, CheckAddress
} from '../../constants';
import IntlTelInput from 'react-intl-tel-input';
import 'react-intl-tel-input/dist/main.css';
import Payment from 'payment';
import * as EmailValidator from 'email-validator';

class BuyComponent extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        this.state = {
            curIn: '600',
            curOut: '0',
            selectIn: 'USD',
            selectOut: 'BTC',
            tempSelect: '',
            currencyList: [],
            search: [],
            walletAddress: '',
            email: '',
            country: '',
            phoneNumber: '',
            cardNumber: '',
            cardDate: '',
            cvc: '',
            name: '',
            selectFor: '',
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
                isValidCVC: false,
                phoneNumber: {
                    isValid: false,
                    errorText: ''
                }
            }
        };
    }

    // componentWillMount() {
    //     axios.get(GetCurrencies)
    //         .then(res =>
    //         {
    //             this.setState({ currencyList: res.data.result });
    //         });

    //     axios.get(ConvertAmount + this.state.selectIn + '/' + this.state.selectOut + '/' + this.state.curIn)
    //         .then(res =>
    //         {
    //             this.setState({ curOut: res.data });
    //         });
    // }

    componentDidMount() {
        this._isMounted = true;

        axios.get(GetCurrencies)
            .then(res =>
            {
                if (this._isMounted) {
                    this.setState({ currencyList: res.data.result });
                }
            });

        axios.get(ConvertAmount + this.state.selectIn + '/' + this.state.selectOut + '/' + this.state.curIn)
            .then(res =>
            {
                if (this._isMounted)
                    this.setState({ curOut: res.data });
            });
        document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
        
        // Payment
        var 
            number = document.getElementById("cardNumber"),
            exp = document.getElementById("cardDate"),
            cvc = document.getElementById("cvc");

        Payment.formatCardNumber(number, 16);
        Payment.formatCardExpiry(exp);
        Payment.formatCardCVC(cvc);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const handleChange = (e) => {
            this.setState({
                [e.target.name]: e.target.value
            });
        }

        const handleButtonClickS1 = () => {
            if (this.state.curIn === '' || this.state.curOut === '' || this.state.curOut === 0)
                return;
            this.setState(prevState => ({ stage: prevState.stage++ }));
            this.props.navbarShow();
            document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
        }

        const handleButtonClickS2 = async () => {
            let errorsEmail = this.state.errors.email;
            let errorsAddress = this.state.errors.walletAddress;
            let errorsPhoneNum = this.state.errors.phoneNumber;
            
            if (this.state.email === '') {
                errorsEmail.errorText = 'Required field';
                await this.setState({ errorsEmail });
                document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
            }

            
            if (this.state.phoneNumber === '') {
                errorsPhoneNum.errorText = 'Required field';
                await this.setState({ errorsPhoneNum });
                document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
            }

            if (this.state.walletAddress === '') {
                errorsAddress.errorText = 'Required field';
                await this.setState({ errorsAddress });
                document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
                return;
            }

            if (!errorsEmail.isValid || !errorsPhoneNum.isValid)
                return;

            // check wallet address
            var arr = {
                address: this.state.walletAddress,
                currency: this.state.selectOut
            };
            var result = await axios.post(CheckAddress, arr)
                 .then(res => res.data.result);

            if (result === 'not_valid') {
                errorsAddress.errorText = 'Invalid address';
                await this.setState({ errorsAddress });
                document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
                return;
            }

            document.getElementById("stages").style.height = document.getElementById("stageThree").clientHeight + 'px';

            this.setState(prevState => ({ stage: prevState.stage++ }));
        }

        const handleButtonClickS3 = () => {
            var errors = this.state.errors;
            if (!errors.isValidCardNumber || !errors.isValidCardDate || !errors.isValidCVC || this.state.name.length === 0)
                return;
        }

        const handleCurInput = async (e) => {
            var name = e.target.name;
            const URL = name === 'curIn' ? ConvertAmount : ConvertAmountOut;
            await handleChange(e);
            const convertFrom = this.state.selectIn;
            const convertTo = this.state.selectOut;
            const InputName = name === 'curIn' ? 'curOut' : 'curIn';
            const amount = name === 'curIn' ? this.state.curIn : this.state.curOut;
            if (amount === '') {
                document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
                return;
            }

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
                    document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
                });
        }

        const handleCurChange = async (currency) => {
            document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
            this.props.navbarShow();
            await this.setState({ stage: 1, [this.state.selectFor]: currency });
            const convertFrom = this.state.selectIn;
            const convertTo = this.state.selectOut;
            const amount = this.state.curIn;
            if (amount === '')
                return;

            await axios.get(ConvertAmount + `${convertFrom}/${convertTo}/${amount}`)
                .then(async res => {
                    if (res.data === 0.0) {
                        await this.setState({
                            curOut: ''
                        });
                    }
                    else {
                        await this.setState({
                            curOut: res.data
                        })
                    }
                    document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
                });
        }

        const handleBackClick = () => {
            this.props.navbarShow();
            this.setState({ stage: 1 });
            document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
        }

        const keyDown = async (event) => {
            var index = this.state.search.map(cur => cur.short_name).indexOf(this.state.tempSelect);
            switch(event.keyCode){
                case 38:
                    index = index > 0 ? --index : 0;
                    await this.setState({ tempSelect: this.state.search[index].short_name });
                    var previousSibling = document.querySelectorAll(".curList li.highlight")[0].previousSibling;
                    if (previousSibling !== null)
                        previousSibling.scrollIntoView(false);
                    break;
                case 40:
                    index = index < this.state.search.length - 1 ? ++index : this.state.search.length - 1;
                    await this.setState({ tempSelect: this.state.search[index].short_name });
                    var nextSibling = document.querySelectorAll(".curList li.highlight")[0].nextSibling;
                    if (nextSibling !== null)
                        nextSibling.scrollIntoView(false);
                    break;
                case 13:
                    handleCurChange(this.state.tempSelect);
                    break;
                default:
                    break;
            }
        }

        // const validEmailRegex = RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);
        // const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
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
                document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
                return;
            }
            if (EmailValidator.validate(value)) {
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

            document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
        }

        const handlePhoneNumberChange = async (valid, number, country, formattedNumber) => {
            var phoneNumErrors = this.state.errors.phoneNumber;
            await this.setState({ country: country.name, phoneNumber: formattedNumber});
            if (number === '') {
                phoneNumErrors.errorText = 'Required field';
                phoneNumErrors.isValid = false;
                this.setState({ phoneNumErrors });
                document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
                return;
            }
            
            if (valid) {
                phoneNumErrors.errorText = '';
                phoneNumErrors.isValid = true;
            }
            else {
                phoneNumErrors.errorText = 'Invalid phone number';
                phoneNumErrors.isValid = false;
            }
            this.setState({ phoneNumErrors });

            document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
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
            
            document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
        }

        const handleCardDateChange = (e) => {
            handleChange(e);
            var 
                exp = document.getElementById("cardDate").value,
                errors = this.state.errors;

            if (Payment.fns.validateCardExpiry(exp)) {
                errors.isValidCardDate = true;
                document.getElementById("cvc").focus();
            }
            else
                errors.isValidCardDate = false;

            this.setState({ errors });
            // var firstNum = target.replace(' / ', '').substring(0, 1);
            // var month;
            // if (firstNum > 1 && firstNum < 10)
            //     month = '0' + target.replace(' / ', '').substring(0, 1);
            // else
            //     month = target.replace(' / ', '').substring(0, 2);
            // var year = target.replace(' / ', '').substring(2, 4);
            // if (month.length === 2) {
            //     if (target.length === 5)
            //         e.target.value = month;
            //     else if (target.length === 4)
            //         e.target.value = month.substring(0, 1);
            //     else
            //         e.target.value = month + ' / ' + year;
            // }
            // var curDate = new Date();
            // var isBiggerThanCurDate = parseInt(year) > parseInt(curDate.getFullYear().toString().substring(2, 4));
            // var isSameWithCurDate = parseInt(year) === parseInt(curDate.getFullYear().toString().substring(2, 4));
            // var errors = this.state.errors;
            // if (isBiggerThanCurDate || (parseInt(month) >= parseInt(curDate.getMonth() + 1) && isSameWithCurDate)) {
            //     errors.isValidCardDate = true;
            //     document.getElementById("cvc").focus();
            // }
            // else
            //     errors.isValidCardDate = false;
            
        }

        const handleCardNumberChange = (e) => {
            handleChange(e);
            var 
                number = document.getElementById("cardNumber").value,
                errors = this.state.errors;
            
            if (Payment.fns.validateCardNumber(number)) {
                errors.isValidCardNumber = true;
                document.getElementById("cardDate").focus();
            }
            else
                errors.isValidCardNumber = false;

            this.setState({ errors });
        }

        const handleCVCChange = (e) => {
            handleChange(e);
            var 
                cvc = document.getElementById("cvc").value,
                errors = this.state.errors;
            
            if (Payment.fns.validateCardCVC(cvc)) {
                errors.isValidCVC = true;
                document.getElementById("cardName").focus();
            }
            else
                errors.isValidCVC = false;

            this.setState({ errors });
        }

        const mouseOverEvent = (e) => {
            this.setState({ tempSelect: e.target.innerHTML });
        }

        const handleSearchChange = (search) => {
            var currencies = this.state.selectFor === 'selectIn' ? selectInCurrencies : selectOutCurrencies;
            const filteredList = currencies.filter(cur => cur.short_name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
            this.setState({ tempSelect: filteredList[0].short_name, search: filteredList });
        }

        const selectInCurrencies = this.state.currencyList.filter(cur => !cur.withdrawEnabled);
        const selectOutCurrencies = this.state.currencyList.filter(cur => cur.withdrawEnabled);

        return (
            <div id="stages">
                <div id="stageOne" className={`form ${this.state.stage === 1 ? "center" : "left"}`}>
                    <div className="currencies">
                        <input placeholder="YOU GIVE" type="number" value={this.state.curIn} name="curIn" onChange={handleCurInput} />
                        <div onClick={() => {
                                this.setState({stage: 'selectCur', selectFor: 'selectIn', tempSelect: selectInCurrencies[0].short_name, search: selectInCurrencies});
                                this.props.navbarShow();
                                document.getElementById("stages").style.height = document.getElementById("stageSelect").clientHeight + 'px';
                            }}>
                            {this.state.selectIn}
                        </div>
                    </div>
                    <div className="currencies">
                        <input placeholder="YOU GET" type="number" value={this.state.curOut} name="curOut" onChange={handleCurInput} />
                        <div onClick={() => {
                                this.setState({stage: 'selectCur', selectFor: 'selectOut', tempSelect: selectOutCurrencies[0].short_name, search: selectOutCurrencies});
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
                    <input placeholder="CRYPTO WALLET ADDRESS" name="walletAddress" type="text" onChange={handleAddressInput} />
                    <span className="details">{this.state.errors.walletAddress.errorText}</span>
                    <input placeholder="EMAIL" name="email" type="text" onChange={handleEmailInput} />
                    <span className="details">{this.state.errors.email.errorText}</span>
                    <div style={{ marginTop: "8px" }}>
                        {/* <select name="country" onChange={handleChange}>
                            <option>RU</option>
                            <option>EN</option>
                        </select>
                        <input placeholder="PHONE NUMBER" name="phoneNumber" type="text" onChange={handleChange} /> */}
                        <IntlTelInput
                            containerClassName="intlTelContainer intl-tel-input"
                            placeholder="PHONE NUMBER"
                            onPhoneNumberChange={handlePhoneNumberChange}
                        />
                        <span className="details">{this.state.errors.phoneNumber.errorText}</span>
                    </div>

                    <button onClick={handleButtonClickS2}>Continue</button>
                </div>

                <div id="stageThree" className={`form ${this.state.stage === 3 ? "center" : "right"}`}>
                    <input className={`${this.state.errors.isValidCardNumber ? "" : "notValidInput"}`} placeholder="ENTER CARD NUMBER" name="cardNumber" id="cardNumber" type="text" onChange={handleCardNumberChange} />
                    <div className="cardInfo">
                        <input className={`${this.state.errors.isValidCardDate ? "" : "notValidInput"}`} placeholder="MM/YY" name="cardDate" id="cardDate" type="text" onChange={handleCardDateChange} />
                        <input className={`${this.state.errors.isValidCVC ? "" : "notValidInput"}`} placeholder="CVC" name="cvc" id="cvc" type="text" onChange={handleCVCChange} />
                    </div>
                    <input placeholder="NAME" name="name" id="cardName" type="text" onChange={handleChange} />
                    
                    <button onClick={handleButtonClickS3}>Buy</button>
                </div>

                <div id="stageSelect" className={`form selectCur ${this.state.stage === 'selectCur' ? "centerCur" : "right"}`}>
                    <SelectComponent handleCurChange={handleCurChange} onKeyDown={keyDown}
                        mouserOver={mouseOverEvent} tempSelect={this.state.tempSelect} onSearchChange={handleSearchChange}
                        handleBackClick={handleBackClick} currencyList={this.state.search} 
                    />
                </div>
            </div>
        );
    }
}

export default BuyComponent;