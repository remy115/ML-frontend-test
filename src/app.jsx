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


class Lista extends React.Component {
    constructor(props) {
        super(props)
        this.lista=props.lista;
    }

    render() {
        var list=this.lista.map((elem)=>{
            var id=elem.id;
            var image=elem.picture;
            var descr=elem.title;
            var shipping=elem.free_shipping;
            // var bolinha=shipping ? 'block' : 'none';
            var preco=elem.price.amount;
            var moeda=elem.price.currency;
            var oioi1=​"oioi333";
            return (
                <div className="item_lista">
                    <a href={link1} className="link_image">
                        <img src={image} alt={descr} />
                    </a>
                    <div className="item_descr">
                        <h2>
                            $ {preco} <div className="bolinha" style={{display:bolinha}}></div>
                        </h2>
                        <h3>
                            <a href={link1}>
                                <p>{descr}</p>
                            </a>
                        </h3>
                    </div>
                </div>
            );
        });
    }
}


class App extends React.Component {
    constructor(props) {
        super(props)
/*
"items":[{"id":"MLA650695729","title":"Soldadora Inverter Dogo Star-175 Uso Profesional + Bolso !","price":{"currency":"Peso argentino","amount":6499,"decimals":2},"picture":"http://mla-s1-p.mlstatic.com/251815-MLA25304824003_012017-I.jpg","condition":"new","free_shipping":true},{"id":"MLA652241526","title":"Grupo Electrógeno Generador Eléctrico Dogo 3500 2.7 Kva","price":{"currency":"Peso argentino","amount":7800,"decimals":2},"picture":"http://mla-s2-p.mlstatic.com/444025-MLA25346058248_022017-I.jpg","condition":"new","free_shipping":true},{"id":"MLA602944057","title":"Generador Electrico Grupo Electrógeno Nafta Dogo 2500 2.3kv","price":{"currency":"Peso argentino","amount":5999,"decimals":2},"picture":"http://mla-s1-p.mlstatic.com/698924-MLA25920440368_082017-I.jpg","condition":"new","free_shipping":false},{"id":"MLA618793078","title":"Soldadora Inverter Dogo Star 255 Bolso + Máscara + Escuadra","price":{"currency":"Peso argentino","amount":12672,"decimals":2},"picture":"http://mla-s2-p.mlstatic.com/945919-MLA25806095388_072017-I.jpg","condition":"new","free_shipping":true}]
*/

        this.lista=ML.listaProds;
    }

    render() {
        if(this.lista && this.lista.items) {
            return <Lista lista={this.lista} />
        }
        return (
            <Busca />
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
);