const express = require('express');
const { ServerConfig } = require('./config');
const apiRoutes = require('./routes'); // By default index.js in required.
const ratelimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true
}));

const limiter = ratelimit.rateLimit({
    windowMs: 2 * 60 * 1000, // 2 min
    max: 30, //Maximum 3 request per 2 minute.
});

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.text());
app.use(limiter);


const authenticateRequest = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Expect "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Token missing' });
    }

    try {
        const decoded = jwt.verify(token, ServerConfig.JWT_SECRET); // Your secret key from config
        req.user = decoded; // Attach decoded payload to request
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};


app.use('/flightService', authenticateRequest, createProxyMiddleware({
    target: ServerConfig.FLIGHT_SERVICE, 
    changeOrigin: true,
    pathRewrite: {'^/flightsService' : '/'}
}));

app.use('/bookingService', authenticateRequest, createProxyMiddleware({
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