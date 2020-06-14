import React, { Component } from 'react';
import {kc,getUser} from './UserManager';
import { Container,Message,Button,Dropdown } from 'semantic-ui-react';

class LoginPage extends Component {

    state = {
        disabled: true,
        loading: true,
    };

    componentDidMount() {
        this.appLogin();
    };

    appLogin = () => {
        getUser((user) => {
            if(user) {
                this.setState({loading: false});
                this.props.checkPermission(user);
            } else {
                this.setState({disabled: false, loading: false});
            }
        });
    };

    userLogin = () => {
        this.setState({disabled: true, loading: true});
        kc.login({redirectUri: window.location.href});
    };

    render() {

        const {disabled, loading} = this.state;

        let login = (<Button size='massive' primary onClick={this.userLogin} disabled={disabled} loading={loading}>Login</Button>);
        //let enter = (<Button size='massive' color='green' onClick={() => this.props.enter()} disabled={disabled} loading={loading}>Enter</Button>);
        let profile = (
            <Dropdown inline text=''>
                <Dropdown.Menu>
                    <Dropdown.Item content='Profile:' disabled />
                    <Dropdown.Item text='My Account' onClick={() => window.open("https://accounts.kbb1.com/auth/realms/main/account", "_blank")} />
                    <Dropdown.Item text='Sign Out' onClick={() => kc.logout()} />
                </Dropdown.Menu>
            </Dropdown>);

        return (
            <Container textAlign='center' >
                <br />
                <Message size='massive'>
                    <Message.Header>
                        {this.props.user === null ? "BB Stream" : "Welcome, "+this.props.user.username}
                        {this.props.user === null ? "" : profile}
                    </Message.Header>
                    <p>WebRTC Streaming Resources</p>
                    {this.props.user === null ? login : this.props.enter}
                </Message>
            </Container>
        );
    }
}

export default LoginPage;
