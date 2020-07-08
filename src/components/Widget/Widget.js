import React from 'react';
import WidgetIcon from '../WidgetIcon/WidgetIcon';
import WidgetForm from '../WidgetForm/WidgetForm';

class Widget extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isShow: false };
    }

    render() {
        const handleIsShow = async () => {
            await this.setState(prevState => ({ isShow: !prevState.isShow }));
        }

        return (
            <div>
                <WidgetIcon handleIsShow={handleIsShow} isShow={this.state.isShow} />
                <WidgetForm handleIsShow={handleIsShow} isShow={this.state.isShow} />
            </div>
        );
    }
}

export default Widget;