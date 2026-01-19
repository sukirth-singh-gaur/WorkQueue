const fs = require('fs');

function logSuccess(task) {
    const payloadStr = JSON.stringify(task.payload || {});
    const text =
    `\nSUCCESS: Task type: ${task.type}` +
    ` Task payload: ${payloadStr}` +
    ` Retries left: ${task.retries}`;

    fs.appendFileSync('logs.txt', text);
    console.log('logged successfully to the file');
}

function logFailure(task, err) {
    const payloadStr = JSON.stringify(task.payload || {});
    const text =
    `\nFAILURE: Task type: ${task.type}` +
    ` Task payload: ${payloadStr}` +
    ` Retries left: ${task.retries}` +
    ` Error message: ${err.message}`;

    fs.appendFileSync('logs.txt', text);
    console.log('logged failure to the file');
}

export { logSuccess, logFailure };
