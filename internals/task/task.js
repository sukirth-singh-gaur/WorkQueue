class Task{
    constructor(type, payload, retries){
        this.type = type;
        this.payload = payload;
        this.retries = retries;
    }
}

class Metrics {
    constructor(total_jobs_in_queue, jobs_done, jobs_failed) {
    this.total_jobs_in_queue = total_jobs_in_queue;
    this.jobs_done = jobs_done;
    this.jobs_failed = jobs_failed;
    }
}

export {Task,Metrics};
