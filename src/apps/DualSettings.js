import React, { Component } from 'react';
import {Button, Label, Segment, Grid, Message, Select} from 'semantic-ui-react';
import {putData} from "../shared/tools";
import {dual_languages} from "../shared/consts";

class DualSettings extends Component {

    state = {
        dual: this.props.dual
    };

    componentDidMount() {
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


    render() {

        const {dual} = this.state;

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
                <Button fluid positive>Start</Button>
            </Segment>
        );
    }
}

export default DualSettings;
