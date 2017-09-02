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
            <header>
                <div className="barra-busca">
                    <img src="/imgs/mercado-livre.png" alt="Todos os produtos em um só lugar!" />
                    <form>
                        <input type="text" name="busca" placeholder="Nunca deixe de buscar" value={this.state.busca} onChange={this.change} />
                        <button className="btn-busca"><i className="icon-glyph"></i></button>
                    </form>
                </div>
            </header>
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