const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const axios = require("axios");

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
const userRoutes = require('./routes/userRoutes');
const themeRouter = require('./routes/themeRouter'); 
const imageRoutes = require('./routes/imageRoutes');


app.use('/users', userRoutes);
app.use('/themes', themeRouter);
app.use('/images', imageRoutes);




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
