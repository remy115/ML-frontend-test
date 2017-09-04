import React from 'react';
import ReactDOM from 'react-dom';

class ListaTop extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        var cats=this.props.cats.map((elem)=>{
            return <span>{elem}</span>
        });
        return (
            <div className="lista-top"><p>{cats}</p></div>
        )
    }
} // ListaTop

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
        this.lista=props.lista.items;
        this.cats=props.lista.categories;
    }

    render() {

        var list=this.lista.map((elem)=>{
            var id=elem.id;
            var image=elem.picture;
            var descr=elem.title;
            var condition=elem.condition;
            if(condition == 'new') {
                condition='Produto Novo';
            } else if(condition == 'used') {
                condition='Produto Usado'
            } else {
                condition='estado indefinido';
            }
            var shipping=elem.free_shipping;
            var bolinha=shipping ? '' : ' hide';
            var preco=elem.price.amount;
            var moeda=elem.price.currency;
            var symbol=elem.price.symbol;
            var link1='/items/'+id;
            return (
                <div key={id} className="item_lista">
                    <a href={link1} className="link_image">
                        <img src={image} alt={descr} />
                    </a>
                    <div className="item_descr">
                        <h2>
                            <strong>{symbol} {preco}<div><span className={'bolinha'+bolinha} style={{display:bolinha}}></span></div></strong>
                        </h2>
                        <h3>
                            <a href={link1}>
                                {descr}
                            </a>
                        </h3>
                    </div>
                    <div className="desc_right">
                        <p>{condition}</p>
                    </div>
                </div>
            );
        });
        return (
            <div className="center-content">
                <ListaTop cats={this.cats} />
                <div id="lista-prods">
                    {list}
                </div>
            </div>
        )
    }
}

class Detalhe extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="center-content">
                <ListaTop cats={this.cats} />
                <div id="produto-detalhe">
                    {list}
                </div>
            </div>
        )

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
        var ret=null;
        if(this.lista && this.lista.items) {
            ret=(<div>
                    <Busca />
                    <Lista lista={this.lista} />
                </div>);
        } else {
            ret=(<div>
                    <Busca />
                </div>)
        }
        return ret;
    } // render
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
);