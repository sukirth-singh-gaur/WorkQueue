const express = require("express");
const {createClient} = require("redis");

const app = express();
app.use(express.json());


const PORT = process.env.PORT_PRODUCER;
// const REDIS_URL = process.env.REDIS_URL;

//Redis Client
const client = createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect().then(()=>{
    console.log("Connected to redis");
}).catch(err=>{
    console.error("Connection to redis failed ",err);
    process.exit(1);
})

//Http Server
app.post('/enqueue',async(req,res)=>{
    const task = req.body;

    if (!task.type) {
    return res.status(400).send('Bad Request');
    }

    if(task.type === 'send_email'){
        if(!task.payload?.to || !task.payload?.subject){
            return res
            .status(400)
            .send('Bad request, pass to and subject fields inside the payload');
        }
    }

    try{
        const queueLen = await client.rPush('task_queue',JSON.stringify(task));
        console.log('Length of queue', queueLength);

        res
        .status(200)
        .send(`Task of type '${task.type}' has been successfully added to the queue`);
    }
    catch(err){
        res
        .status(500)
        .send('Internal Server Err');
    }
});

app.all('/enqueue',(req,res)=>{
    res.status(405).send("Only post methods are allowed");
});

app.listen(PORT,()=>{
    console.log(`server listening on ${PORT}`);
});

