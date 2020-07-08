import React from 'react';
import axios from 'axios';
import SelectComponent from '../SelectComponent/SelectComponent';
import {
    ConvertAmount, ConvertAmountOut, PaymentForm, GetCurrencies, CheckAddress
} from '../../constants';

class ExchangeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curIn: '600',
            curOut: '0',
            selectIn: 'USD',
            selectOut: 'BTC',
            currencyList: [],
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

        const handleButtonClickS1 = () => {
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

            this.setState(prevState => ({ stage: prevState.stage++ }));
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

                    <button onClick={handleButtonClickS1}>Continue</button>
                </div>

                <div id="stageTwo" className={`form ${this.state.stage === 2 ? "center" : this.state.stage === 1 ? "right" : "left"}`}>
                    <input placeholder="CRYPTO WALLET ADDRESS" name="walletAddress" type="text" onChange={handleAddressInput} />
                    <span className="details">{this.state.errors.walletAddress.errorText}</span>

                    <button onClick={handleButtonClickS2}>Change</button>
                </div>

                <div id="stageSelect" className={`form selectCur ${this.state.stage === 'selectCur' ? "centerCur" : "right"}`}>
                    <SelectComponent handleCurChange={handleCurChange} handleBackClick={handleBackClick} currencyList={this.state.selectFor === 'selectIn' ? selectInCurrencies : selectOutCurrencies} />
                </div>
            </div>
        );
    }
}

export default ExchangeComponent;