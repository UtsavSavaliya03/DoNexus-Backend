const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const DatabaseConnection = require('./Database/database.js');
const authRoutes = require('./Routes/Auth/AuthRoutes.js');
const taskRoutes = require('./Routes/Task/TaskRoutes.js');

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

/* --------- Routes --------- */
// Auth
App.use('/api/v1/auth', authRoutes);

// Task
App.use('/api/v1/task', taskRoutes);

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