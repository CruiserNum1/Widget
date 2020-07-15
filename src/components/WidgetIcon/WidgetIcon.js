import React from 'react';
import './index.css';

class WidgetIcon extends React.Component {
    render() {
        const onChangeIsShow = () => {
            this.props.handleIsShow();
        }
        const {isShow} = this.props; 
        return (
            <div className={`widget ${!isShow ? "" : "hidden"}`} onClick={onChangeIsShow}>
                <svg color="inherit" className="lc-1mpchac" viewBox="0 0 32 32"><path fill="#4384F5" d="M12.63,26.46H8.83a6.61,6.61,0,0,1-6.65-6.07,89.05,89.05,0,0,1,0-11.2A6.5,6.5,0,0,1,8.23,3.25a121.62,121.62,0,0,1,15.51,0A6.51,6.51,0,0,1,29.8,9.19a77.53,77.53,0,0,1,0,11.2,6.61,6.61,0,0,1-6.66,6.07H19.48L12.63,31V26.46"></path><path fill="#ffffff" d="M19.57,21.68h3.67a2.08,2.08,0,0,0,2.11-1.81,89.86,89.86,0,0,0,0-10.38,1.9,1.9,0,0,0-1.84-1.74,113.15,113.15,0,0,0-15,0A1.9,1.9,0,0,0,6.71,9.49a74.92,74.92,0,0,0-.06,10.38,2,2,0,0,0,2.1,1.81h3.81V26.5Z" className="lc-p4hxbu e1nep2br0"></path></svg>
            </div>
        );
    }
}

export default WidgetIcon;