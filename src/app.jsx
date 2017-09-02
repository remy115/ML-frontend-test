import React from 'react';
import ReactDOM from 'react-dom';

class Busca extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            busca:''
        }
        this.change=this.change.bind(this);
    }

    change(evt) {
        var name=evt.target.name;
        var value=evt.target.value;
        this.setState({
            [name]:value
        });
    }

    render() {
        return (
            <div className="barra-busca">
                <img src="/imgs/mercado-livre.png" alt="Todos os produtos em um só lugar!" />
                <input type="text" name="busca" value={this.state.busca} onChange={this.change} />
            </div>
        )
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Busca />
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
);