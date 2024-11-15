
const { Client } = require('pg');
const { client } = require('../database/databaseConnection');

exports.fetch_tasks = async (req, res, next) => {
    try {
        const fetchTasksQuery = await client.query('SELECT * FROM tasks');


        res.status(200).json({
            success: true,
            message: fetchTasksQuery.rows.length === 0 ? "No tasks found" : "Tasks retrieved successfully",
            tasks: fetchTasksQuery.rows.map(task => ({
                task_id: task.id,
                task_title: task.task_title,
                task_description: task.task_description,
                startDate: task.startdate, 
                lastdate: task.lastdate,   
                status: task.status
            }))
        });
    } catch (error) {
        console.error("Error Loading tasks:", error);
        res.status(500).json({
            success: false,
            message: "Error in loading Tasks",
            error: error.message
        });
    }
}


exports.create_task = async (req, res) => {
    const { title, description, assignedTo, startDate, lastDate } = req.body;

    // Validate the input
    if (!title || !description || !Array.isArray(assignedTo) || assignedTo.length === 0) {
        return res.status(400).json({ error: "All fields are required and assignedTo must be an array." });
    }

    try {
        // Convert the `assignedTo` array into a PostgreSQL-compatible format
        const assignedToPGArray = `{${assignedTo.join(',')}}`;

        const createTaskQuery = await client.query(
            `INSERT INTO tasks (task_title, task_description, startDate, lastDate, status, assigned_to)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, description, startDate, lastDate, 'Pending', assignedToPGArray]
        );

        if (createTaskQuery.rows.length) {
            return res.status(201).json({
                success: true,
                message: "Task created successfully",
                task: createTaskQuery.rows[0],
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Unable to create task",
            });
        }
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({
            success: false,
            message: "Task creation failed",
            error: error.message,
        });
    }
};



exports.delete_task = async (req, res, next) => {
    
    const {id}= req.body;
    
    try {
      
        const deleteTaskQuery= await client.query('DELETE FROM tasks WHERE task_id = $1',[id])
    
    } catch (error) {
        console.log("Error in Deleting Task",error)
        res.status(500).json({
            success: false,
            message: "Task deletion failed",
            error: error.message,
        });
    }
}