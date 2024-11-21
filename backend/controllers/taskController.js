
const { Client } = require('pg');
const { client } = require('../database/databaseConnection');

exports.fetch_tasks = async (req, res, next) => {
    try {
        const fetchTasksQuery = await client.query('SELECT * FROM tasks');

        res.status(200).json({
            success: true,
            message: fetchTasksQuery.rows.length === 0 ? "No tasks found" : "Tasks retrieved successfully",
            tasks: fetchTasksQuery.rows.map(task => ({
                task_id: task.task_id,
                task_title: task.task_title,
                task_description: task.task_description,
                startDate: task.startdate ? new Date(task.startdate).toISOString() : null, // Ensure valid date
                lastDate: task.lastdate ? new Date(task.lastdate).toISOString() : null,
                status: task.status,
                participants: task.assigned_to ? task.assigned_to.replace(/^{|}$/g, '').split(',') : []
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

    // Validate the incoming data
    if (!title || !description || !Array.isArray(assignedTo) || assignedTo.length === 0 || !startDate || !lastDate) {
        return res.status(400).json({ error: "All fields are required and assignedTo must be an array." });
    }

    try {
        const startDateISO = new Date(startDate).toISOString();
        const lastDateISO = new Date(lastDate).toISOString();

        const assignedToPGArray = `{${assignedTo.join(',')}}`;

        const createTaskQuery = await client.query(
            `INSERT INTO tasks (task_title, task_description, startDate, lastDate, status, assigned_to)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, description, startDateISO, lastDateISO, 'Pending', assignedToPGArray]
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

exports.update_status = async (req, res, next) => {
    const { taskId } = req.params;

    // Check if taskId is provided
    if (!taskId) {
        return res.status(400).json({
            success: "false",
            message: "TaskID is Required"
        });
    }

    try {
  
        const statusUpdateQuery = await client.query(
            'UPDATE tasks SET status = $1 WHERE task_id = $2 RETURNING *', 
            ['Complete', taskId]
        );

        // Check if any rows were updated
        if (statusUpdateQuery.rowCount === 0) {
            return res.status(404).json({
                success: "false",
                message: "Task not found or already updated"
            });
        }

        res.status(200).json({
            success: "true",
            message: "Status updated to 'Complete'",
            task: statusUpdateQuery.rows[0] // Return the updated task
        });
    } catch (error) {
        console.error('Unable to change Task Status:', error);
        res.status(500).json({
            success: "false",
            message: "Unable to change task status",
            error: error.message
        });
    }
};

exports.delete_task = async (req, res, next) => {
    const { taskId } = req.params;

    if (!taskId) {
        res.status(404).json({
            success: "false",
            message: "TaskID is Required"
        })
    }

    // console.log(`Recieved taskID as Parameter:`+req.params)
    try {
        const deleteTaskQuery = await client.query('DELETE FROM tasks WHERE task_id = $1 RETURNING *', [taskId]);

        if (deleteTaskQuery.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Task Deleted Successfully",
                task: deleteTaskQuery.rows[0]
            });
        }

    } catch (error) {
        console.log("Error in Deleting Task", error);
        return res.status(500).json({
            success: false,
            message: "Task deletion failed",
            error: error.message,
        });
    }
};
