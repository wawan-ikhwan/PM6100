require('dotenv').config();

const net = require('net');

const publisherSockets = []; //para publishers

const subscriberSockets = []; // para subscribers

const broadcast = (msg) => { // broadcast data ke semua subscriber
    //Loop through the active subscribers object
    subscriberSockets.forEach((sub) => {
        sub.write(msg);
    });
};

const listCurrentDevices = () => {
    console.log('========CURRENT PUBS========');
    publisherSockets.forEach((dev) => {
        console.log(dev.remoteAddress+':'+dev.remotePort);
    });
    
    console.log('========CURRENT SUBS========');
    subscriberSockets.forEach((dev) => {
        console.log(dev.remoteAddress+':'+dev.remotePort);
    });

    console.log('============================');
}

const terminatePublisher = (msg, socket) => {
    const index = publisherSockets.indexOf(socket);
    if (index !== -1) { // jika index ditemukan
        publisherSockets[index].end();
        console.log('Publisher '+publisherSockets[index].remoteAddress+':'+publisherSockets[index].remotePort+' has '+msg+' !');
        publisherSockets.splice(index, 1);
        listCurrentDevices();
    }
}

const terminateSubscriber = (msg,socket) => {
    const index = subscriberSockets.indexOf(socket);
    if (index !== -1) { // jika index 
        subscriberSockets[index].end();
        console.log('Subscriber '+subscriberSockets[index].remoteAddress+':'+subscriberSockets[index].remotePort+' has '+msg+' !');
        subscriberSockets.splice(index, 1);
        listCurrentDevices();
    }
}

// PUBLISHER SECTION
const publisher = net.createServer((socket)=> {

    publisherSockets.push(socket);
    console.log('Publisher '+socket.remoteAddress+':'+socket.remotePort+' has connected !');
    listCurrentDevices();
    socket.setEncoding('ascii');
    socket.setKeepAlive(true,0);

    socket.on('data',(data)=>{
        if(subscriberSockets.length>0){ // cek jika ada subscribers
            broadcast(data);
        }
    });
    socket.on('close',(e)=>{
        terminatePublisher('closed error='+e,socket);
    });
    socket.on('drain',()=>{
        console.log('Publisher is no data!');
    });
    socket.on('error',(e)=>{
        console.log(e);
        terminatePublisher('error',socket);
    });
    socket.on('end',()=>{
        terminatePublisher('disconnected', socket);
    });
});
publisher.listen(process.env.WRITE_PORT, process.env.HOST);

// SUBSCRIBER SECTION
const subscriber = net.createServer((socket)=>{

    subscriberSockets.push(socket);
    console.log('Subscriber '+socket.remoteAddress+':'+socket.remotePort+' has connected !');
    listCurrentDevices();
    socket.setKeepAlive(true,0);

    socket.on('close',(e)=>{
        terminateSubscriber('closed error='+e,socket);
    });
    socket.on('error',(e)=>{
        console.log(e);
        terminateSubscriber('error',socket);
    });
    socket.on('end', () => {
        terminateSubscriber('disconnected',socket);
    });
})
subscriber.listen(process.env.READ_PORT, process.env.HOST);
