const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

app.use(cors());
app.options('*', cors());

const api = process.env.API_URL;
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const ordersRouter = require('./routers/orders');
const usersRouter = require('./routers/users');
const authJwt = require('./helper/jwt');
const errorHandler = require('./helper/error-handler');

//Middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);

//Routers
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);

mongoose.connect(process.env.CONNECTION_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // dbName: 'eshop-database',
}).then(()=>{
    console.log('Database Connection is ready...')
}).catch((err)=>{
    console.log(err);
});

app.listen(3000, ()=>{
    console.log(api);
    console.log("server is running http://localhost:3000");
});

