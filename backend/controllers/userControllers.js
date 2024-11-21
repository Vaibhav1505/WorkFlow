const bcrypt = require('bcrypt')
const { client } = require('../database/databaseConnection')

exports.fetch_users = async function (req, res, next) {

    try {
        const fetchUserQuery = await client.query("SELECT * FROM users")

        res.status(200).json({
            success: "true",
            message: fetchUserQuery.length == 0 ? "There is no User to Fetch" : "Fetch user Successful",
            NumberOfUser:fetchUserQuery.length,
            User: fetchUserQuery.rows.map((user) => ({
                firstName: user.firstname,
                lastName: user.lastname,
                email: user.email,
                phone: user.phone
            }))
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: "false",
            error: error.message
        })
    }

}

exports.user_signup = async function (req, res, next) {

    const { firstName, lastName, phone, email, password } = req.body;
    try {
        const existingUserQuery = await client.query('SELECT * FROM users where email= $1 or phone= $2', [email, phone])

        if (existingUserQuery.rows.length > 0) {
            res.status(409).json({
                success: "false",
                message: "User already exist with email or Phone Number"
            })
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const resultQuery = await client.query(
                'INSERT INTO users (firstName, lastName, phone, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [firstName, lastName, phone, email, hashedPassword]
            );
            if (resultQuery.rows.length) {
                res.status(201).json({
                    success: "true",
                    message: "User created successfully",
                    user: resultQuery.rows[0]

                })
            } else {
                console.log("User creation Failed")
                res.status(500).json({
                    message: "Unable to create User"
                })
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: "false",
            error: error.message
        })

    }
}


exports.user_signin = async function (req, res, next) {
    try {
        const { identifier, password } = req.body;

        // Await the query to get the user by email or phone
        const existingUserQuery = await client.query(
            'SELECT * FROM users WHERE email = $1 OR phone = $2',
            [identifier, identifier]
        );

        // Check if any user was found
        if (existingUserQuery.rows.length === 0) {
            return res.status(404).json({
                success: "false",
                message: "User does not exist"
            });
        }

        const user = existingUserQuery.rows[0];

        // Compare the provided password with the stored hashed password
        const passwordMatched = await bcrypt.compare(password, user.password);

        if (!passwordMatched) {
            return res.status(401).json({
                success: "false",
                message: "Invalid credentials"
            });
        }


        res.status(200).json({
            success: "true",
            message: "Login successful",
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: "false",
            message: "There was an error logging in the user: " + error.message
        });
    }
};