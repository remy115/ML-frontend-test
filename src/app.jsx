import React from 'react';
import ReactDOM from 'react-dom';
import {Error,ListaTop} from './utils/utils';



class Busca extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            search:this.props.buscado || ''
        }

        this.change=this.change.bind(this);
        this.submit=this.submit.bind(this);
    }

    change(evt) {
        var name=evt.target.name;
        var value=evt.target.value;
        this.setState({
            [name]:value
        });
    }

    submit(evt) {
        var busca=this.state.search;
        if(!busca) {
            evt.preventDefault();
            return false;
        }
        return true;
    }

    render() {
        return (
            <header>
                <div className="barra-busca">
                    <a href="/"><img src="/imgs/mercado-livre.png" alt="Todos os produtos em um só lugar!" /></a>
                    <form method="GET" action="/items" onSubmit={this.submit}>
                        <input type="text" name="search" placeholder="Nunca deixe de buscar" value={this.state.search} onChange={this.change} />
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
        if(!this.cats.length) {
            this.cats=['Nada encontrado!']
        }
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
        if( ! list.length) {
            list=(
                <Error>
                    <h3>Não foram encontrados produtos segundo sua busca!</h3>
                    <ul>
                        <li>Revise sua ortografia.</li>
                        <li>Navegue pela categoria de produtos.</li>
                        <li>Utilize termos mais genéricos ou menos termos.</li>
                    </ul>
                </Error>
            )
        }
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
        // props.item;
        this.buscado=null;
        if(this.props.buscado) {
            this.buscado=<a href={'/items?search='+this.props.buscado}>Voltar à busca</a>
        }
    }

    render() {
        const item=this.props.item;
        const price=item.price;
        var cats=item.categories;
        cats=cats.map((elem)=>{
            return elem.name;
        });
        return (
            <div className="center-content">
                <ListaTop cats={cats} buscado={this.buscado} extraClasses={['lista-top-detalhe']} />
                <div id="produto-detalhe">
                    <div className="left">
                        <img src={item.picture} alt={item.title} />
                        <h2>Descrição do Produto</h2>
                        <p dangerouslySetInnerHTML={{__html:item.description}}></p>
                    </div>
                    <div className="right">
                        <p className="right-top">Unidades vendidas: {item.sold_quantity}</p>
                        <h3>{item.title}</h3>
                        <h2>{price.symbol} {price.amount}</h2>
                        <button className="comprar">Comprar</button>
                    </div>
                </div>
            </div>
        )

    }
} // Detalhe

class App extends React.Component {
    constructor(props) {
        super(props)
/*
"items":[{"id":"MLA650695729","title":"Soldadora Inverter Dogo Star-175 Uso Profesional + Bolso !","price":{"currency":"Peso argentino","amount":6499,"decimals":2},"picture":"http://mla-s1-p.mlstatic.com/251815-MLA25304824003_012017-I.jpg","condition":"new","free_shipping":true},{"id":"MLA652241526","title":"Grupo Electrógeno Generador Eléctrico Dogo 3500 2.7 Kva","price":{"currency":"Peso argentino","amount":7800,"decimals":2},"picture":"http://mla-s2-p.mlstatic.com/444025-MLA25346058248_022017-I.jpg","condition":"new","free_shipping":true},{"id":"MLA602944057","title":"Generador Electrico Grupo Electrógeno Nafta Dogo 2500 2.3kv","price":{"currency":"Peso argentino","amount":5999,"decimals":2},"picture":"http://mla-s1-p.mlstatic.com/698924-MLA25920440368_082017-I.jpg","condition":"new","free_shipping":false},{"id":"MLA618793078","title":"Soldadora Inverter Dogo Star 255 Bolso + Máscara + Escuadra","price":{"currency":"Peso argentino","amount":12672,"decimals":2},"picture":"http://mla-s2-p.mlstatic.com/945919-MLA25806095388_072017-I.jpg","condition":"new","free_shipping":true}]
*/

        this.lista=ML.listaProds;
        this.buscado=ML.buscado;
        this.error=ML.error;
    }

    render() {
        var ret=null;
        if(this.lista && this.lista.items) {
            window.sessionStorage.setItem('ML_last_search',this.buscado);
            ret=(<div>
                    <Busca buscado={this.buscado} />
                    <Lista lista={this.lista} />
                </div>);
        } else if(this.lista && this.lista.item) {
            var buscado=window.sessionStorage.getItem('ML_last_search');
            ret=(<div>
                    <Busca />
                    <Detalhe item={this.lista.item} buscado={buscado} />
            </div>);
        } else if(this.error) {
            ret=(
                <div>
                    <Busca />
                    <div className="center-content">
                        <Error>
                            <h2>{this.error}</h2>
                            <p className="ret-inicial"><a href="/">Retornar à página inicial</a></p>
                        </Error>
                    </div>
                </div>
            )
        } else {
            window.sessionStorage.setItem('ML_last_search','');
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