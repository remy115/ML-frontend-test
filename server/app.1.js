const path=require('path')
const querystring=require('querystring')
const https=require('https')
const express=require('express')
const concat_stream=require('concat-stream')

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
    lista=JSON.stringify(lista);

    var html=`<!doctype html>
    <html lang="pt-br">
        <head>
            <meta charset="utf-8" >
            <meta name="description" content="A maior Comunidade de compra e venda online da América Latina.">
            <link rel="stylesheet" href="/css/fontello.css" >
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


function getCurrencies(arr) {
    return new Promise((resolve,reject)=>{

        const iter=arr.entries();
        const arrCurr=[];
        function conn() {
            const val=iter.next();
            // terminamos?
            // console.log(val);
            if(val.done) {
                return resolve(arrCurr);
            }
            const curr=val.value[1].currency_id;


            // já temos?
            if(arrCurr.findIndex(elem=>elem.id===curr) > -1) {
                return conn();
            }
            // result.available_filters
            // https://api.mercadolibre.com/currencies/ARS
            var req=https.request({
                host:'api.mercadolibre.com',
                path:'/currencies/'+curr
            });
            req.on('response',(res)=>{
                res.pipe(concat_stream(function(chunk) {
                    var obj=JSON.parse(chunk.toString());
                    arrCurr.push({
                        id:curr,
                        currency:obj.description,
                        decimals:obj.decimal_places,
                        symbol:obj.symbol
                    });
                    conn();
                }));
            });
            req.end();
        }
        conn();
    });
}


app.use(express.static(path.resolve(__dirname,'../public')));


app.get('/',function(req,res) {
    const html=render1({
        title:'Encontre todo tipo de produto!'
    });
    res.send(html);
});


// busca de produtos
app.get('/itens',function(req,res) {
    const html=render1({
        title:query,
        jsVars:{lista:
            {"author":"Remy","lastname":"Barros","categories":["Herramientas","Jardines y Exteriores","Música, Películas y Series","Accesorios para Vehículos"],"items":[{"id":"MLA650695729","title":"Soldadora Inverter Dogo Star-175 Uso Profesional + Bolso !","price":{"currency":"Peso argentino","symbol":"$","amount":6499,"decimals":2},"picture":"http://mla-s1-p.mlstatic.com/251815-MLA25304824003_012017-I.jpg","condition":"new","free_shipping":true},{"id":"MLA652241526","title":"Grupo Electrógeno Generador Eléctrico Dogo 3500 2.7 Kva","price":{"currency":"Peso argentino","symbol":"$","amount":7800,"decimals":2},"picture":"http://mla-s1-p.mlstatic.com/444025-MLA25346058248_022017-I.jpg","condition":"new","free_shipping":true},{"id":"MLA602944057","title":"Generador Electrico Grupo Electrógeno Nafta Dogo 2500 2.3kv","price":{"currency":"Peso argentino","symbol":"$","amount":5999,"decimals":2},"picture":"http://mla-s1-p.mlstatic.com/698924-MLA25920440368_082017-I.jpg","condition":"new","free_shipping":false},{"id":"MLA618793078","title":"Soldadora Inverter Dogo Star 255 Bolso + Máscara + Escuadra","price":{"currency":"Peso argentino","symbol":"$","amount":12672,"decimals":2},"picture":"http://mla-s2-p.mlstatic.com/945919-MLA25806095388_072017-I.jpg","condition":"new","free_shipping":true}]}
        }
    });
    return res.send(html);



    // https://api.mercadolibre.com/sites/MLA/search?q=:query
    const host='api.mercadolibre.com';
    const proto='https:';
    var path='/sites/MLA/search?q=';
    var query=req.query.search;
    path+=querystring.escape(query);
    const req2=https.request({
        protocol:proto,
        host:host,
        path:path
    });
    req2.end();
    req2.on('response',(res2)=>{
        // res2.pipe(res);
        // return;
        res2.pipe(concat_stream((resBuffer)=>{
            var result=resBuffer.toString();
            result=JSON.parse(result);

            var categories=[];
            var itens=[];
            var cat=result.available_filters.length ? result.available_filters[0] : null;
            if(cat) {
                categories=cat.values.map((elem)=>{
                    return elem.name;
                });
            }
            categories.splice(4);
            var results=result.results;
            results.splice(4);

            // console.log(results);
            getCurrencies(results)
                .then((ret)=>{
                    // console.log(ret);
                    itens=results.map((elem)=>{
                        var curr=ret.find(elem2=>elem2.id===elem.currency_id);
                        return {
                            id:elem.id,
                            title:elem.title,
                            price:{
                                currency:curr.currency,
                                symbol:curr.symbol,
                                amount:parseInt(elem.price),
                                decimals:parseInt(curr.decimals) || 0
                            },
                            picture:elem.thumbnail,
                            condition:elem.condition,
                            free_shipping:elem.shipping.free_shipping
                        }
                    });
                    var retObj={
                        author:'Remy',
                        lastname:'Barros',
                        categories:categories,
                        items:itens
                    }

                    return res.set('Content-Type','text/json').send(retObj);
                    const html=render1({
                        title:query,
                        jsVars:{
                            lista:retObj
                        }
                    });
                    return res.send(html);

                })
                .catch((err)=>{
                    console.log(err);
                    res.status(500).send(err);
                });

            // console.log(result.site_id);
            // res.set('Content-Type','text/json').send({oi:'oi33o3'});
        }));
    });


    // res.send(query);
});


app.listen(3004,()=>{
    console.log('listening on port 3004');
});