import React from 'react';
import axios from 'axios';
import SelectComponent from '../SelectComponent/SelectComponent';
import {
    ConvertAmount, ConvertAmountOut, GetCurrencies, CheckAddress
} from '../../constants';

class ExchangeComponent extends React.Component {
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
            stage: 1,
            errors: {
                walletAddress: {
                    isValid: false,
                    errorText: ''
                }
            }
        };
    }

    componentDidMount() {
        this._isMounted = true;

        axios.get(GetCurrencies)
            .then(res =>
            {
                if (this._isMounted)
                    this.setState({ currencyList: res.data.result });
            });

        axios.get(ConvertAmount + this.state.selectIn + '/' + this.state.selectOut + '/' + this.state.curIn)
            .then(res =>
            {
                if (this._isMounted)
                    this.setState({ curOut: res.data });
            });
        document.getElementById("stages").style.height = document.getElementById("stageOne").clientHeight + 'px';
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
            let errorsAddress = this.state.errors.walletAddress;

            if (this.state.walletAddress === '') {
                errorsAddress.errorText = 'Required field';
                await this.setState({ errorsAddress });
                document.getElementById("stages").style.height = document.getElementById("stageTwo").clientHeight + 'px';
                return;
            }

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

                    <button onClick={handleButtonClickS2}>Change</button>
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

export default ExchangeComponent;