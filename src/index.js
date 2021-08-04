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

const listCurrentDevices = (devs,type) => {
    if (type === 'pub'){
        console.log('========CURRENT PUBS========');
    }
    else if (type === 'sub'){
        console.log('========CURRENT SUBS========');
    }
    devs.forEach((dev) => {
        console.log(dev.remoteAddress+':'+dev.remotePort);
    });
        console.log('============================');
}

// PUBLISHER SECTION
const publisher = net.createServer((socket)=> {

    publisherSockets.push(socket);
    console.log('Publisher '+socket.remoteAddress+':'+socket.remotePort+' has connected!');
    socket.setEncoding('ascii');
    socket.setKeepAlive(true,0);

    socket.on('data',(data)=>{
        if(subscriberSockets.length>0){ // cek jika ada subscribers
            broadcast(data);
        }
    });
    socket.on('close',(e)=>{
        console.log('Publisher has closed! Error:'+e);
    });
    socket.on('drain',()=>{
        console.log('Publisher is no data!');
    });
    socket.on('error',(e)=>{
        console.log(e);
    });
    socket.on('end',()=>{
        // remove the publishers for list
        const index = publisherSockets.indexOf(socket);
        if (index !== -1) { // jika index ditemukan
            console.log('Publisher '+publisherSockets[index].remoteAddress+':'+publisherSockets[index].remotePort+' has disconnected!');
            publisherSockets.splice(index, 1);
            listCurrentDevices(publisherSockets, 'pub');
        }
    });
});
publisher.listen(process.env.WRITE_PORT, process.env.HOST);

// SUBSCRIBER SECTION
const subscriber = net.createServer((socket)=>{

    subscriberSockets.push(socket);
    console.log('Subscriber '+socket.remoteAddress+':'+socket.remotePort+' has connected!');
    socket.setKeepAlive(true,0);

    socket.on('error',(e)=>{
        console.log(e);
    });
    socket.on('close',(e)=>{
        console.log('Subscriber has closed! Error:'+e);
    });
    socket.on('end', () => {
        // remove the subscriber for list
        const index = subscriberSockets.indexOf(socket);
            if (index !== -1) { // jika index ditemukan
                console.log('Subscriber '+subscriberSockets[index].remoteAddress+':'+subscriberSockets[index].remotePort+' has disconnected!');
                subscriberSockets.splice(index, 1);
                listCurrentDevices(subscriberSockets, 'sub');
            }
    });
})
subscriber.listen(process.env.READ_PORT, process.env.HOST);
