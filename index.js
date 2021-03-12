var app = require('express')();
var bp = require('body-parser');
const {
    wordsToNumbers
} = require('words-to-numbers');
var getConnectionPool = require('./DB');
require('dotenv').config()
app.use(bp.json());
var PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('Server started at port : ', PORT);
});

async function response(statusCode, data, res) {
    res.status(statusCode).json(data);
}
async function payloadValidation(movieData, res) {
    let validationStatus = true;
    if (movieData.name == '' || movieData.name == null || movieData.name == undefined) {
        validationStatus = false;
        response(400, {
            message: 'Movie name is mandatory field!!'
        }, res);

    }
    if (movieData.year == '' || movieData.year == null || movieData.year == undefined) {
        validationStatus = false;
        response(400, {
            message: 'Movie year is mandatory field!!'
        }, res);

    }
    if (movieData.director == '' || movieData.director == null || movieData.director == undefined) {
        validationStatus = false;
        response(400, {
            message: 'Movie director name is mandatory field!!'
        }, res);

    }
    return validationStatus;
}
app.get('/movies', async (req, res) => {
    return new Promise(async (resolve, reject) => {
        var con = await getConnectionPool();
        var count;
        try {
            count = wordsToNumbers(req.query.query)
        } catch (error) {
            response(400, {
                message: 'Please provide the counting properly!!!'
            }, res);
            return;
        }
        if (con != null) {
            try {
                console.log('No of record requested : ', count);
                await con.connection.collection(process.env.COLLECTION_NAME).find().limit(count).toArray(function (err, result) {
                    if (err) throw err;
                   // console.log(result);
                  //  con.connection.close();
                    response(200, {
                        data: result
                    }, res);
                    return;
                });

            } catch (error) {
                console.log(error);
                response(503, {
                    message: 'Database service unavailable, can not fetch data at this moment'
                }, res);
                return;
            }
        } else {
            response(503, {
                message: 'Database service unavailable, can not fetch data at this moment'
            }, res);
            return;
        }


    })
})
app.post('/movies', async (req, res) => {
    var con = await getConnectionPool();
    // console.log(con)
    if (con != null) {
        let data = req.body;
        let flag = 0;
        data.forEach(async (d) => {
            if (!await payloadValidation(d, res)) {
                flag = 1;
            }
        });
        if (flag == 0) {
            let obj = {};
            for (let index = 0; index < data.length; index++) {
                obj[data[index].name] = data[index]
            }
            let uniqueArray = Object.values(obj);
          //  console.log(uniqueArray);
            try {
                await con.connection.collection(process.env.COLLECTION_NAME).createIndex({
                    name: 1
                }, {
                    unique: true
                })
                await con.connection.collection(process.env.COLLECTION_NAME).insertMany(uniqueArray);
                response(201, {
                    message: 'Movie data inserted successfully!!'
                }, res);
                return;
            } catch (error) {
                console.error('DB error : ', error);
                if (error.toString().includes("duplicate")) {
                    response(400, {
                        message: 'Duplicate movie name exist!!'
                    }, res);
                    return;
                } else {
                    response(503, {
                        message: 'Database service unavailable, can not insert data at this moment'
                    }, res);
                    return;
                }
            } 
        } else {
            console.log("payload validation failed");
        }
    } else {
        response(503, {
            message: 'Database service unavailable'
        }, res);
        return;
    }
});
app.post('/movie', async (req, res) => {
    var con = await getConnectionPool();
    // console.log(con)
    if (con != null) {
        var movieData = req.body;
       // console.log('Movie data : ', movieData);
        let status = await payloadValidation(movieData, res);
        if (status) {
            try {
                await con.connection.collection(process.env.COLLECTION_NAME).createIndex({
                    name: 1
                }, {
                    unique: true
                })
                await con.connection.collection(process.env.COLLECTION_NAME).insertOne(movieData);
                response(201, {
                    message: 'Movie data inserted successfully!!'
                }, res);
                return;
            } catch (error) {
                console.error('DB error : ', error.toString().includes("duplicate"));
                if (error.toString().includes("duplicate")) {
                    response(400, {
                        message: 'This Movie already exist!!'
                    }, res);
                    return;
                } else {
                    response(503, {
                        message: 'Database service unavailable, can not insert data at this moment'
                    }, res);
                    return;
                }
            } 
        } else {
            console.log("Payload validation failed!!!");
        }
    } else {
        response(503, {
            message: 'Database service unavailable'
        }, res);
        return;
    }
});
module.exports = app;