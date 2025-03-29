const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const DatabaseConnection = require('./Database/database.js');

const App = express();

/* --------- Database connection --------- */
DatabaseConnection()
    .then()
    .catch((err) => {
        console.error('Database connection failed. Exiting application.');
        process.exit(1); // Exit the process if database connection fails
    });

App.use(cors());

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));

App.use('/', (req, res) => {
    res.status(404).json({
        status: false,
        msg: "Bad request...!"
    })
})

process.on('uncaughtException', (error) => {
    // console.error('Caught exception: ' + error);
});

module.exports = App;