import React, { Component, Fragment } from 'react';
import {Button} from "semantic-ui-react";
import LoginPage from '../components/LoginPage';
import {kc} from "../components/UserManager";

class MainPage extends Component {

    state = {
        pass: false,
        user: null,
        roles: [],
    };

    checkPermission = (user) => {
        const gxy_user = kc.hasRealmRole("gxy_user");
        if(gxy_user) {
            this.setState({user, roles: user.roles});
        } else {
            alert("Access denied!");
            //kc.logout();
        }
    };

    render() {

        const {user} = this.state;

        let opt = [
            <Button size='massive' color='green' onClick={() => window.open("https://stream.kli.one/shidur","_self")} >Admin</Button>,
            <Button size='massive' color='green' onClick={() => window.open("https://stream.kli.one/dual","_self")} >Dual</Button>,
            <Button size='massive' color='green' onClick={() => window.open("https://stream.kli.one/audio","_self")} >Audio</Button>,
            <Button size='massive' color='green' onClick={() => window.open("https://galaxy.kli.one/stream","_self")} >Stream</Button>
        ]

        return (
            <Fragment>
                <LoginPage user={user} enter={opt} checkPermission={this.checkPermission} />
            </Fragment>

        );
    }
}

export default MainPage;