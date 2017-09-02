const path=require('path');

module.exports={
    entry:'./src/app.jsx',
    output:{
        path:path.resolve(__dirname,'public','js'),
        filename:'bundle.js'
    },
    module:{
        rules:[
            {test:/src\/.+\.jsx?$/, loader:'babel-loader'}
        ]
    }
}