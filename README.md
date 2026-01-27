# WorkQueue

A Distributed Background Task Processing System written in **JavaScript (Node.js)**, using **Redis** for job queuing.


## High-Level Overview

**WorkQueue** is a distributed background task processing system designed to execute long-running or asynchronous tasks **outside the main request–response cycle**, improving application responsiveness and scalability.

The system is intentionally modular and simple, making it easy to add new task types and understand how real-world background workers function.


## Why Do We Need This?

In modern web applications, certain operations should **not block user requests**, such as:

* Sending emails
* Generating PDFs
* Resizing images
* Calling third-party APIs

### Example

When a user signs in to your website, you may want to send them a welcome email.

**Without WorkQueue**
The API waits until the email is sent → slow response.

**With WorkQueue**
The API enqueues a `send_email` task → responds immediately → worker handles the email in the background.

This leads to:

* Faster API responses
* Better user experience
* Improved system scalability


## System Architecture

WorkQueue consists of **two independent services**:

```
Client → Producer → Redis Queue → Worker → Task Execution
```


## Services

### Producer

The **Producer** is responsible for:

* Accepting tasks via an HTTP API
* Validating task input
* Pushing tasks into Redis
* Never executing tasks itself

#### Endpoint

```
POST /enqueue
```

#### How to Add a Job

Send an HTTP POST request to the Producer service.

##### Example Request

```json
{
  "type": "send_email",
  "retries": 3,
  "payload": {
    "to": "worldisweird2020@gmail.com",
    "subject": "testing producer"
  }
}
```

##### Field Explanation

| Field     | Description                                  |
| --------- | -------------------------------------------- |
| `type`    | **Required**. Identifies the task to execute |
| `retries` | Number of retry attempts if execution fails  |
| `payload` | Arbitrary key-value data used by the task    |



### Task Representation (JavaScript)

```js
{
  type: String,
  payload: Object,
  retries: Number
}
```

The payload is intentionally flexible to support **any task type**.



### Producer Response

On success:

```
Task of type 'send_email' has been successfully added to the queue
```


## Worker

The **Worker** is responsible for:

* Pulling tasks from Redis
* Executing them concurrently
* Retrying failed tasks
* Logging outcomes
* Exposing runtime metrics

##  Metrics Endpoint

The Worker exposes:

```
GET /metrics
```

### Example Response

```json
{
  "total_jobs_in_queue": 5,
  "jobs_done": 12,
  "jobs_failed": 2
}
```

### Metrics Explained

| Metric                | Description                       |
| --------------------- | --------------------------------- |
| `total_jobs_in_queue` | Number of jobs currently in Redis |
| `jobs_done`           | Total successfully executed jobs  |
| `jobs_failed`         | Total failed jobs                 |


## How Jobs Are Executed

Task execution logic lives inside the Worker.

Each task type is handled using a **switch statement**, making the system highly extensible.

### Example Task Processor (JavaScript)

```js
async function processTask(task) {
  if (!task.payload) {
    throw new Error("payload is empty");
  }

  switch (task.type) {
    case "send_email":
      console.log(
        "Sending email to",
        task.payload.to,
        "with subject",
        task.payload.subject
      );
      break;

    case "resize_image":
      console.log(
        "Resizing image to x:",
        task.payload.new_x,
        "y:",
        task.payload.new_y
      );
      break;

    case "generate_pdf":
      console.log("Generating pdf...");
      break;

    default:
      throw new Error("unsupported task");
  }
}
```

### Adding a New Task Type

To add a new task:

1. Add a new `case` in the switch
2. Implement the task logic
3. Done — no other changes required


## Concurrency Model

* Workers use **Redis blocking operations (`BLPOP`)**
* Multiple workers can run concurrently
* Redis guarantees **only one worker processes a task**
* No locks are required

### Parallelism

True parallelism is achieved by running **multiple worker processes**:

```bash
node worker.js
node worker.js
node worker.js
```

Each process runs independently and competes for tasks via Redis.


##  Logging

Every task execution is logged to `logs.txt`.

### Logged Information

* Task type
* Task payload
* Remaining retries
* Error message (on failure)


## Design Principles

* **Producer is stateless**
* **Workers are stateless**
* **Redis handles coordination**
* **Retries belong to the task**
* **Metrics are read-only**
* **No shared memory between workers**

##  Running the Project

### Start Redis

```bash
redis-server
```

### Start Producer

```bash
node producer.js
```

### Start Worker

```bash
node worker.js
```

### Enqueue a Task

```bash
curl -X POST http://localhost:3000/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "type": "send_email",
    "retries": 3,
    "payload": {
      "to": "test@example.com",
      "subject": "Hello"
    }
  }'
```

## Learning Outcomes

This project demonstrates understanding of:

* Background job queues
* Redis as a coordination layer
* Concurrency vs parallelism
* Stateless worker design
* Retry mechanisms
* Observability patterns

## Summary

**WorkQueue** is a minimal yet realistic background processing system that mirrors how production systems handle asynchronous work — without unnecessary abstractions.

