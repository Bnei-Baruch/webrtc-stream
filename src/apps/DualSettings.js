import React, { Component } from 'react';
import {Button, Label, Segment, Grid, Message, Select} from 'semantic-ui-react';
import {putData,streamFetcher} from "../shared/tools";
import {dual_languages} from "../shared/consts";

class DualSettings extends Component {

    state = {
        disabled: false,
        loading: false,
        dual: this.props.dual,
        status: "Off",
    };

    componentDidMount() {
        this.encoderStatus();
    };

    saveState = (dual) => {
        putData(`webrtc/dual`, dual, (cb) => {
            console.log("Save state: ",cb);
        });
    };

    setDual = (value,id,side) => {
        let {dual} = this.state;
        dual[id][side] = value;
        this.setState({dual});
        this.saveState(dual);
    };

    encoderStatus = () => {
        let req = {req: "dual", id: "status"};
        streamFetcher(req,  (data) => {
            let status = data.stdout.replace(/\n/ig, '');
            console.log(":: Got Encoder status: ",status);
            this.setState({status});
        });
    };

    encoderExec = () => {
        this.setState({disabled: true, loading: true});
        setTimeout(() => this.setState({disabled: false, loading: false}), 2000);
        let {status} = this.state;
        let req = {id:"dual", req: status === "On" ? "stop" : "start"};
        streamFetcher(req,  (data) => {
            console.log(":: Start Encoder status: ",data);
            status = status === "On" ? "Off" : "On";
            this.setState({status});
        });
    };


    render() {

        const {dual,status,disabled,loading} = this.state;

        let dual_selection = Object.keys(dual).map((id, i) => {
            let data = dual[id];
            let {left,right} = data;
            return (
                <Grid stretched key={i}>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <Select
                                placeholder="Left:"
                                value={left}
                                options={dual_languages}
                                onChange={(e,{value}) => this.setDual(value,id,"left")} />
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Select
                                placeholder="Right:"
                                value={right}
                                options={dual_languages}
                                onChange={(e,{value}) => this.setDual(value,id,"right")} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )
        });

        return (
            <Segment textAlign='center' color='grey' >
                <Label attached='top'>
                    Dual Settings
                </Label>
                <Message>
                    {dual_selection}
                </Message>
                <Button fluid
                        disabled={disabled}
                        loading={loading}
                        positive={status === "Off"}
                        negative={status === "On"}
                        onClick={this.encoderExec} >
                    {status === "On" ? "Stop" : "Start"}
                </Button>
            </Segment>
        );
    }
}

export default DualSettings;
