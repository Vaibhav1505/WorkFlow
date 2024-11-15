const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: process.env.Postgres_Password,
    database: process.env.Postgres_Database_name
});

module.exports = {
    connectDatabase: async function () {
        try {
            await client.connect();
            console.log("Connected to Postgres Database");
        } catch (error) {
            console.error("There is an Error in Connecting Postgres Database: " + error.message);
            process.exit(1);
        }
    },
    client
};

