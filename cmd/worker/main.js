const express = require("express");
const { createClient } = require("redis");
require("dotenv").config();

const { processTask } = require("../../internal/worker/worker");
const logger = require("../../internal/logger/logger");

// Metrics (shared state)
let total_jobs_in_queue = 0;
let jobs_done = 0;
let jobs_failed = 0;

const PORT = process.env.PORT_WORKER;
const WORKER_COUNT = 3;

//Redis Client
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect().then(()=>{
    console.log("Connected to redis");
}).catch(err=>{
    console.error("Connection to redis failed ",err);
    process.exit(1);
})

async function runWorker(workerId) {
    console.log(`Worker ${workerId} started`);

    while (true) {
        try {
            const res = await rdb.blPop("task_queue", 0);
            const task = JSON.parse(res.element);

            total_jobs_in_queue = await rdb.lLen("task_queue");

            let retries_left = task.retries;
        try {
            await processTask(task);
            jobs_done++;
            logger.logSuccess(task);
            console.log("Task done successfully");
        } catch (err) {
            jobs_failed++;
            retries_left--;
            logger.logFailure(task, err);
            console.log("Error processing task:", err.message);

            if (retries_left > 0) {
                task.retries = retries_left;
                await rdb.rPush("task_queue", JSON.stringify(task));
            } else {
                console.log("Task failed after all retries");
            }
        }
    }   catch (err) {
            console.error("Worker error:", err);
        }
    }
}

// Start workers (like goroutines)
for (let i = 0; i < WORKER_COUNT; i++) {
    runWorker(i + 1);
}

// Metrics server
const app = express();

app.get("/metrics", (req, res) => {
    res.json({
        total_jobs_in_queue,
        jobs_done,
        jobs_failed,
    });
});

app.listen(PORT, () => {
    console.log(`Metrics server running on port ${PORT}`);
});
