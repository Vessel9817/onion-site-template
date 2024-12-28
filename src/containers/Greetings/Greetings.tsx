import React, { PureComponent } from 'react';
import icon from '../../assets/img/icon-128.png';

interface GreetingState {
    readonly name: string;
}

class GreetingComponent extends PureComponent<{}, GreetingState> {
    state = {
        name: 'dev'
    };

    render() {
        return (
            <div>
                <p>Hello, {this.state.name}!</p>
                <img src={icon} alt="extension icon" />
            </div>
        );
    }
}

export default GreetingComponent;
