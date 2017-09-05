const path=require('path')
const querystring=require('querystring')
const https=require('https')
const express=require('express')
const concat_stream=require('concat-stream')

const app=express();

const port=parseInt(process.argv[2]) || 3004;


// mini "template engine"
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

    var lista=[],
        buscado='',
        error='';
    if(jsVars) {
        if(jsVars.lista)
            lista=jsVars.lista;
        if(jsVars.buscado)
            buscado=jsVars.buscado;
        if(jsVars.error)
            error=jsVars.error;
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
                    listaProds:${lista},
                    buscado:'${buscado}',
                    error:'${error}'
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

function getCategories(req,res,next) {
    var cat_id=req.midObj ? req.midObj.category_id : null;
    if(!cat_id) {
        return next();
    }

    cat_id=querystring.escape(cat_id);
    var path=`/categories/${cat_id}`;
    const req2=https.request({
        host:'api.mercadolibre.com',
        path:path
    });
    req2.on('response',function(response) {
        return response.pipe(concat_stream((buffered)=>{
            buffered=buffered.toString();
            buffered=JSON.parse(buffered);
            req.midObj.categories=buffered.path_from_root;
            return next();
        }));
    });
    req2.end();
} // getCategories

function makeConn(req,res,next) {
    // console.log(req.midObj);
    const arrConn=req.midObj;

    Promise.all(arrConn.map((elem)=>{
        return new Promise(function(resolve,reject) {
            const host=elem.objConn.host;
            const proto = elem.objConn.proto || 'https:';
            var path=elem.objConn.path;
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
                    // req.midObj=elem.cb(req.midObj,result);
                    elem.cb(req.midObj,result);
                    return resolve(result);
                }));
            });
        });
    })).then((ret)=>{
        return next();
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
app.get(['/items','/api/items','/items/:id','/api/items/:id'],function(req,res,next) {
    // https://api.mercadolibre.com/sites/MLA/search?q=:query
    const host='api.mercadolibre.com';
    const proto='https:';
    var originalUrl=req.originalUrl;
    if(originalUrl.indexOf('/api/') > -1) {
        originalUrl=true;
    } else {
        originalUrl=null;
    }
    req.isApi=originalUrl;
    var id=req.params.id;
    if(!id) {
        var path='/sites/MLA/search?q=';
        var query = originalUrl === true ? req.query.q : req.query.search;
        path+=querystring.escape(query);
        req.midObj=[{
            objConn:{host,path},
            cb:function(midObj,result) {
                result=JSON.parse(result);
                result.results.splice(4);
                midObj.items=result.results;
                midObj.result=result;
                // return {items:result.results,result:result}
            }
        }]
    } else {
        id=querystring.escape(id);
        req.midObj=[
            {
                objConn:{host,path:`https://api.mercadolibre.com/items/${id}/description`},
                cb:function(midObj,result) {
                    result=JSON.parse(result);
                    midObj.description=result.plain_text;
                }
            },
            {
                objConn:{host,path:`https://api.mercadolibre.com/items/${id}`},
                cb:function(midObj,result) {
                    result=JSON.parse(result);
                    midObj.items=[result];
                    midObj.category_id=result.category_id;
                }
            }
        ]
    }
    return next();


},makeConn,getCategories,getCurrencies,function(req,res,next) {
    var html;
    const author={author:'Remy',lastname:'Barros'}
    var id=req.params.id;
    const arrCurr=req.midObj.arrCurr;
    if(!id) {
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
        var retObj=Object.assign({},author,{categories:categories,items:itens});

        // return res.set('Content-Type','text/json').send(retObj);
        html=render1({
            title:query,
            jsVars:{
                lista:retObj,
                buscado:query
            }
        });
        
    } else {
        var item=req.midObj.items[0];
        // error
        if(item.error) {
            return next(item);
        }

        var curr=arrCurr.find(elem2=>elem2.id===item.currency_id);
        var description=req.midObj.description;
        description=description.replace(/\r\n/g,'<br>');

        item={
            id:item.id,
            categories:req.midObj.categories,
            title:item.title,
            price:{
                currency:curr.currency,
                symbol:curr.symbol,
                amount:parseInt(item.price),
                decimals:parseInt(curr.decimals) || 0
            },
            picture:item.thumbnail,
            condition:item.condition,
            free_shipping:item.shipping.free_shipping,
            sold_quantity:item.sold_quantity,
            description:description
        };
       var retObj=Object.assign({},author,{item});

        // return res.set('Content-Type','text/json').send(retObj);
        html=render1({
            title:item.title,
            jsVars:{
                lista:retObj,
            }
        });

    }
    if(req.isApi === true) {
        return res.set('Content-Type','text/json').send(retObj);
    } else {
        return res.send(html);
    }

});


// ERROR HANDLER
app.use(function(err,req,res,next) {

    var msg=err.error;
    if(msg === 'not_found') {
        msg='Página não encontrada!';
    }
    html=render1({
        title:'Página não encontrada',
        jsVars:{
            error:msg
        }
    });

    return res.status(400).send(html);
});


app.listen(port,()=>{
    console.log(`listening on port ${port}`);
});