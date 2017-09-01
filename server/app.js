const express=require('express')

const app=express();

function render1(params) {
    if(!params) params={};
    const titleBase='Mercado Livre - ';
    var title = params.title || 'Nunca deixe de buscar!';
    if(params.title2) {
        title=params.title2;
    } else {
        title=titleBase+title;
    }
    const js = params.js;
    const jsVars = params.jsVars;

    var lista=[];
    if(jsVars) {
        if(jsVars.lista)
            lista=jsVars.lista;
    }
    lista=JSON.stringify(jsVars.lista);

    var html=`<!doctype html>
    <html lang="pt-br">
        <head>
            <meta charset="utf-8" >
            <meta name="description" content="A maior Comunidade de compra e venda online da América Latina.">
            <link rel="stylesheet" href="/css/style.css" >
            <title>${title}</title>
            <script>
                var ML={
                    listaProds:${lista}
                }
            </script>
        </head>
        <body>
            <div id="react"></div>
            <script src="/js/bundle.js"></script>
        </body>
    </html>
    `;
    return html;
}


app.get('/',function(req,res) {
    const html=render1({
        title:'Encontre todo tipo de produto!'
    });
    res.send(html);
});