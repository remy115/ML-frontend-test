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


function getCurrencies(req,res,next) {
    const arr=req.midObj.items;

    const iter=arr.entries();
    const arrCurr=[];
    function conn() {
        const val=iter.next();
        // terminamos?
        // console.log(val);
        if(val.done) {
            req.midObj.arrCurr=arrCurr;
            return next();
        }
        const curr=val.value[1].currency_id;


        // já temos?
        if(arrCurr.findIndex(elem=>elem.id===curr) > -1) {
            return conn();
        }
        // result.available_filters
        // https://api.mercadolibre.com/currencies/ARS
        var req2=https.request({
            host:'api.mercadolibre.com',
            path:'/currencies/'+curr
        });
        req2.on('response',(res)=>{
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
        req2.end();
    }
    conn();

} // getCurrencies


function makeConn(req,res,next) {
    const objConn=req.midObj.objConn;
    const host=req.midObj.objConn.host;
    const proto = req.midObj.objConn.proto || 'https:';
    var path=req.midObj.objConn.path;
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
            req.midObj=req.midObj.cb(req.midObj,result);
            return next();
        }));
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
app.get('/items',function(req,res,next) {
    // https://api.mercadolibre.com/sites/MLA/search?q=:query
    const host='api.mercadolibre.com';
    const proto='https:';
    var path='/sites/MLA/search?q=';
    var query=req.query.search;
    path+=querystring.escape(query);
    req.midObj={
        objConn:{host,path},
        cb:function(midObj,result) {
            result=JSON.parse(result);
            result.results.splice(4);
            return {items:result.results,result:result}
        }
    }
    return next();


},makeConn,getCurrencies,function(req,res) {
    const result=req.midObj.result;
    const query=req.query.search;
    var categories=[];
    var itens=[];
    var cat=result.available_filters.length ? result.available_filters[0] : null;
    if(cat) {
        categories=cat.values.map((elem)=>{
            return elem.name;
        });
    }
    categories.splice(4);

    // console.log(results);
    const arrCurr=req.midObj.arrCurr;
    itens=result.results.map((elem)=>{
        var curr=arrCurr.find(elem2=>elem2.id===elem.currency_id);
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

    // return res.set('Content-Type','text/json').send(retObj);
    const html=render1({
        title:query,
        jsVars:{
            lista:retObj
        }
    });
    return res.send(html);

});


app.listen(3004,()=>{
    console.log('listening on port 3004');
});