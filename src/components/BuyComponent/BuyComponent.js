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
import { connect } from 'react-redux';
import { buyComponentState } from '../../Redux/actions';
import Checkbox from 'react-checkbox-component';

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
            searchText: '',
            walletAddress: '',
            email: '',
            country: '',
            phoneNumber: '',
            cardNumber: '',
            cardDate: '',
            cvc: '',
            name: '',
            selectFor: '',
            isButtonDisabled: false,
            isAgreeded: false,
            hasTag: false,
            tag: '',
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

    async componentDidMount() {
        this._isMounted = true;
        
        // initial state
        const { prevState } = this.props;
        await this.setState({
            curIn: prevState.curIn,
            selectIn: prevState.selectIn,
            selectOut: prevState.selectOut
        });

        axios.get(GetCurrencies)
            .then(res =>
            {
                if (this._isMounted) {
                    this.setState({ currencyList: res.data.result });
                this.props.onCurrencyChange(res.data.result.filter(cur => cur.short_name === this.state.selectOut)[0].name);
                }
            });

        axios.get(ConvertAmount + this.state.selectIn + '/' + this.state.selectOut + '/' + this.state.curIn)
            .then(res =>
            {
                if (this._isMounted)
                    if (res.data !== 0.0)
                        this.setState({ curOut: res.data });
            });
        
        // document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
        
        // Payment
        var 
            number = document.getElementById("cardNumber"),
            exp = document.getElementById("cardDate"),
            cvc = document.getElementById("cvc");

        Payment.formatCardNumber(number, 16);
        Payment.formatCardExpiry(exp);
        Payment.formatCardCVC(cvc);

        document.getElementsByClassName('checkbox')[0].setAttribute('type', 'button');
    }

    componentWillUnmount() {
        this._isMounted = false;

        // When changed type
        this.props.onChangeType(buyComponentState({
            curIn: this.state.curIn,
            selectIn: this.state.selectIn,
            selectOut: this.state.selectOut
        }));
    }

    async handleButtonClickS1(e) {
        e.preventDefault();
        if (this.state.stage !== 1)
            return;
        
        if (this.state.curIn === '' || this.state.curOut === '' || parseFloat(this.state.curOut) === 0)
            return;
        
        await this.setState(prevState => ({ stage: prevState.stage++ }));
        document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
        this.props.navbarShow();
    }

    async handleButtonClickS2(e) {
        e.preventDefault();
        if (this.state.stage !== 2)
            return;
        
        let errorsEmail = this.state.errors.email;
        let errorsAddress = this.state.errors.walletAddress;
        let errorsPhoneNum = this.state.errors.phoneNumber;
        
        if (!errorsEmail.isValid) {
            errorsEmail.errorText = 'Incorrect email';
            await this.setState({ errorsEmail });
            document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
        }

        if (!errorsPhoneNum.isValid) {
            errorsPhoneNum.errorText = 'Invalid phone number';
            await this.setState({ errorsPhoneNum });
            document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
        }

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
        this.setState({ isButtonDisabled: true });
        var arr = {
            address: this.state.walletAddress,
            currency: this.state.selectOut
        };
        var result = await axios.post(CheckAddress, arr)
             .then(res => res.data.result);

        if (result === 'not_valid') {
            errorsAddress.errorText = 'Invalid address';
            await this.setState({ errorsAddress, isButtonDisabled: false });
            document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
            return;
        }

        this.setState(prevState => ({ stage: prevState.stage++, isButtonDisabled: false }));
        document.getElementById("stages").style.height = document.getElementById("stageThree").clientHeight + 'px';
    }

    handleButtonClickS3(e) {
        e.preventDefault();
        var errors = this.state.errors;
        if (!errors.isValidCardNumber || !errors.isValidCardDate || !errors.isValidCVC || this.state.name.length === 0)
            return;
        
        // const {
        //     curIn,
        //     curOut,
        //     selectIn,
        //     selectOut,
        //     walletAddress,
        //     email,
        //     country,
        //     phoneNumber,
        //     cardNumber,
        //     cardDate,
        //     cvc,
        //     name,
        // } = this.state;

        // let dataObj = {
        //     amountOut: curIn,
        //     cnfhash: null,
        //     couponCode: "",
        //     fp: "",
        //     fp2: "",
        //     fullAddInfo: "{}",
        //     socialfp: "",
        //     referer: window.location.href,
        //     getParams: window.location.search || null,
        //     partner: new URL(window.location).searchParams.get('partner'),
        //     transaction_id: 0,
        //     cashinAddInfo: {
        //         full_name: name,
        //         cardholder_name: value_fullNameCard,
        //         card_data: JSON.stringify({
        //             card: cardNumber,
        //             expiryDate: cardDate,
        //             cvc: cvc
        //         })
        //         // ksid: ksClientID,
        //     },
        //     addInfo: {}
        //     // addInfo: "{\"tag\":null,\"cryptoAddress\":\"1FeGgKxU5gjC562wZXd67VTVfwcSjpqv3Y\",\"userId\":\"dcsa@mail.ru\",\"email\":null,\"cur_from\":\"USD\",\"cur_to\":\"INTT\",\"ymId\":\"1592331596708493231\",\"send.amount\":\"100\"}",
        //     // cashinAddInfo: "{\"full_name\":\"cdasc ddcas\",\"cardholder_name\":\"cdasc ddcas\",\"card_data\":\"{\"card\":\"4111 1111 1111 1111\",\"expiryDate\":\"12 / 40\",\"cvc\":\"123\"}\",\"ksid\":\"L!946f24fa-f8bf-0a31-2aeb-baf84d349e15_2\",\"phone\":\"998911234567\",\"bday\":\"2000-10-10\"}"
        // };

        // delete window.document.referrer;
        // window.document.__defineGetter__('referrer', function () {
        //     return "https://indacoin.com/payment/en?partner=indacoin";
        // });

        // axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        // // axios.defaults.headers.common['referer'] = 'https://indacoin.com/payment/en?partner=indacoin';
        // axios.post("https://indacoin.com/gw/payment_form.aspx/registerChangeV1_1", dataObj)
        //      .then(res => console.log(res));
    }

    render() {
        const handleChange = (e) => {
            this.setState({
                [e.target.name]: e.target.value
            });
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
                        if (InputName === 'curIn')
                            res.data = res.data.toFixed(2);
                        await this.setState({
                            [InputName]: res.data
                        })
                    }
                    document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
                });
        }

        const handleCurChange = async (currency, tag) => {
            this.props.navbarShow();
            await this.setState({ stage: 1, [this.state.selectFor]: currency, searchText: '' });
            
            if (this.state.selectFor === 'selectOut') {
                await this.setState({ hasTag: tag });
                if (tag === false)
                    await this.setState({ tag: '' });
                var curFullName = selectOutCurrencies.filter(cur => cur.short_name === currency)[0].name;
                this.props.onCurrencyChange(curFullName);
            }

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
            this.setState({ stage: 1, searchText: '' });
            // document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
        }

        const handleBackButtonClick = async () => {
            if (this.state.stage === 2) {
                let errorsEmail = this.state.errors.email;
                let errorsAddress = this.state.errors.walletAddress;
                let errorsPhoneNum = this.state.errors.phoneNumber;
                errorsEmail.errorText = '';
                errorsAddress.errorText = '';
                errorsPhoneNum.errorText = '';
                this.setState({ errorsEmail, errorsAddress, errorsPhoneNum });
                this.props.navbarShow();
                // document.getElementById("stages").style.height = this.state.hasTag ? document.getElementById('stageOne').clientHeight + 'px' : '276px';
                document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
            }
            else if (this.state.stage === 3)
                document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
            
            await this.setState(prevState => ({ stage: prevState.stage-- }));
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
            if (filteredList.length === 0)
                this.setState({ search: filteredList, searchText: search });
            else
                this.setState({ tempSelect: filteredList[0].short_name, search: filteredList, searchText: search });
        }

        const handleCheckboxChange = (checked) => {
            this.setState({ isAgreeded: checked });
        }

        const handleCheckboxLabelClick = (e) => {
            if (e.target.getAttribute('name') === 'checkboxLabel')
                this.setState(prevState => ({ isAgreeded: !prevState.isAgreeded }));
        }

        const onValueInputKeyPress = (event) => {
            const charCode = (event.which) ? event.which : event.keyCode;

            if (charCode !== 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
                event.preventDefault();
                return false;
            }

            return true;
        }

        const selectInCurrencies = this.state.currencyList.filter(cur => !cur.withdrawEnabled);
        const selectOutCurrencies = this.state.currencyList.filter(cur => cur.withdrawEnabled);

        return (
            <div id="stages" style={{ height: '276px' }}>
                <div id="stageOne" className={`form ${this.state.stage === 1 ? "center" : "left"}`}>
                    <form onSubmit={this.handleButtonClickS1.bind(this)}>
                        <div className="currencies">
                            <input placeholder="YOU GIVE" type="text" value={this.state.curIn} name="curIn" onKeyPress={onValueInputKeyPress} onChange={handleCurInput} />
                            <div onClick={() => {
                                    this.setState({stage: 'selectCur', selectFor: 'selectIn', tempSelect: selectInCurrencies[0].short_name, search: selectInCurrencies});
                                    this.props.navbarShow();
                                    // document.getElementById("stages").style.height = document.getElementById("stageSelect").clientHeight + 'px';
                                }}>
                                {this.state.selectIn}
                            </div>
                        </div>
                        <div className="currencies">
                            <input placeholder="YOU GET" type="text" value={this.state.curOut} name="curOut" onKeyPress={onValueInputKeyPress} onChange={handleCurInput} />
                            <div onClick={() => {
                                    this.setState({stage: 'selectCur', selectFor: 'selectOut', tempSelect: selectOutCurrencies[0].short_name, search: selectOutCurrencies});
                                    this.props.navbarShow();
                                    // document.getElementById("stages").style.height = document.getElementById("stageSelect").clientHeight + 'px';
                                }}>
                                {this.state.selectOut}
                            </div>
                        </div>
                        {this.state.curOut === '' && 
                            <span className="details">This pair is temporarily unavailable or amount is too small</span>
                        }

                        <div>
                            <Checkbox size="big" color="blue" shape="square" isChecked={this.state.isAgreeded} onChange={handleCheckboxChange} />
                            <span className="checkboxLabel" name="checkboxLabel" onClick={(e) =>handleCheckboxLabelClick(e)}>I accept the <a href="https://indacoin.com/terms">terms</a> of the <a href="https://indacoin.com/terms">user agreement</a></span>
                        </div>

                        <button style={{ marginTop: '38px' }} disabled={!this.state.isAgreeded} className="mainButton" type="submit">Continue</button>
                    </form>
                </div>

                <div id="stageTwo" className={`form ${this.state.stage === 2 ? "center" : this.state.stage === 1 || this.state.stage === 'selectCur' ? "right" : "left"}`}>
                    <form onSubmit={this.handleButtonClickS2.bind(this)}>
                        <input placeholder="CRYPTO WALLET ADDRESS" name="walletAddress" type="text" onChange={handleAddressInput} />
                        <span className="details">{this.state.errors.walletAddress.errorText}</span>
                        {this.state.hasTag && 
                            <input placeholder="TAG" name="tag" type="text" value={this.state.tag} onChange={handleChange} />
                        }
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

                        <button className="backButton" type="button" onClick={handleBackButtonClick}>Back</button>
                        <button disabled={this.state.isButtonDisabled} type="submit">Continue</button>
                    </form>
                </div>

                <div id="stageThree" className={`form ${this.state.stage === 3 ? "center" : "right"}`}>
                    <form onSubmit={this.handleButtonClickS3.bind(this)}>
                        <input className={`${this.state.errors.isValidCardNumber ? "" : "notValidInput"}`} placeholder="ENTER CARD NUMBER" name="cardNumber" id="cardNumber" type="text" onChange={handleCardNumberChange} />
                        <div className="cardInfo">
                            <input className={`${this.state.errors.isValidCardDate ? "" : "notValidInput"}`} placeholder="MM/YY" name="cardDate" id="cardDate" type="text" onChange={handleCardDateChange} />
                            <input className={`${this.state.errors.isValidCVC ? "" : "notValidInput"}`} placeholder="CVC" name="cvc" id="cvc" type="text" onChange={handleCVCChange} />
                        </div>
                        <input style={{ marginBottom: '0' }} placeholder="NAME" name="name" id="cardName" type="text" onChange={handleChange} />
                        
                        <button className="backButton" type="button" onClick={handleBackButtonClick}>Back</button>
                        <button type="submit">Continue</button>
                    </form>
                </div>

                <div id="stageSelect" className={`form selectCur ${this.state.stage === 'selectCur' ? "centerCur" : "right"}`}>
                    <SelectComponent handleCurChange={handleCurChange} onKeyDown={keyDown} searchText={this.state.searchText}
                        mouserOver={mouseOverEvent} tempSelect={this.state.tempSelect} onSearchChange={handleSearchChange}
                        handleBackClick={handleBackClick} currencyList={this.state.search}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        prevState: state.buyComponent
    }
}

BuyComponent = connect(mapStateToProps)(BuyComponent);

export default BuyComponent;