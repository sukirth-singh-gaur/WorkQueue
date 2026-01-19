async function processTask(task) {
    if(!task.payload){
        throw new Error("Payload is empty");
    }

    switch (task.type) {
        case 'send_email':
            console.log(`Sending email to ${task.payload.to} with subject ${task.payload.subject}`);
            break;
        case 'resize_image':
            console.log(`Resizing image to ${task.payload.new_x} x ${task.payload.new_y}`);
            break;
        case 'generate_pdf':
            console.log(`Generating pdf ...`);
            break;
        
        default:
            throw new Error(`Unsupported task`);
            break;
    }
}
export {processTask};