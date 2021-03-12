const mongoose = require('mongoose');
require('dotenv').config()
var schema = require('./schema')
mongoose.model('Movie',schema);
var pool = null;
var getConnectionPool =async ()=>{
    if(pool==null){
        try {
            console.log('creating new connection');
            pool = mongoose.connect(process.env.DB_URI, { poolSize: 4,useNewUrlParser: true,useUnifiedTopology: true });            
        } catch (error) {
            console.log("err : ",error);
            pool = null;
        }
    }
    return pool;
}
module.exports=getConnectionPool;
