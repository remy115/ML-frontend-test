import React from 'react';


class Error extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="nao-encontrado" id="error">
                {this.props.children}
            </div>
        )
    }
}

class ListaTop extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        var extraClasses=this.props.extraClasses || '';
        if(extraClasses)
            extraClasses=' '+extraClasses.join(' ');

        var cats=this.props.cats.map((elem,index)=>{
            return <span key={index}>{elem}</span>
        });
        return (
            <div className={"lista-top"+extraClasses}><p>{this.props.buscado}{cats}</p></div>
        )
    }
} // ListaTop

module.exports={Error,ListaTop}