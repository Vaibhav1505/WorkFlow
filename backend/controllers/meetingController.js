
const { Client } = require('pg');
const { client } = require('../database/databaseConnection');

exports.create_meeting = async (req, res, next) => {

    const { name, description, venue, participants, startDate, endDate, host } = req.body;

    console.log('Req.body:'+JSON.stringify(req.body))

    const participantsArray = Array.isArray(participants) ? participants : participants.split(',');

    try {
        const createEventQuery = await client.query('INSERT INTO meeting (meeting_title, meeting_description, participants, startDate, endDate, venue, host) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, description, participantsArray, startDate, endDate, venue, 'Self']);

        if (createEventQuery.rows.length > 0) {
            return res.status(200).json({
                success: "true",
                meesage: "Event created Successfully",
                Event: createEventQuery.rows[0]
            })
        } else {
            return res.status(500).json({
                success: "false",
                message: "Unable to create Event",
            })
        }
    } catch (error) {
        console.error("Error creating Event:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create Event",
            error: error.message,
        });
    }
}