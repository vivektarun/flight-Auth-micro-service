const express = require('express');
const { ServerConfig } = require('./config');
const apiRoutes = require('./routes'); // By default index.js in required.
const ratelimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const limiter = ratelimit.rateLimit({
    windowMs: 2 * 60 * 1000, // 2 min
    max: 3, //Maximum 3 request per 2 minute.
});

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.text());
app.use(limiter);

app.use('/flightService', createProxyMiddleware({
    target: ServerConfig.FLIGHT_SERVICE, 
    changeOrigin: true,
    pathRewrite: {'^/flightsService' : '/'}
}));

app.use('/bookingService', createProxyMiddleware({
    target: ServerConfig.BOOKING_SERVICE, 
    changeOrigin: true,
    pathRewrite: {'^/bookingService': '/'}
}));


app.get('/', (req, res) => {
    res.send("service is up");
});

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`Server running on http://localhost:${ServerConfig.PORT}`);
})