require('dotenv').config();

const net = require('net');

let clientSockets = [];

const broadcast = (msg) => {
    //Loop through the active clients object
    clientSockets.forEach((client) => {
        client.write(msg);
    });
};

const server = net.createServer((socket)=> {
    console.log('ESP <-- '+socket.remoteAddress+':'+socket.remotePort);
    socket.setEncoding('ascii');
    socket.setKeepAlive(true,0);
    socket.on('data',(data)=>{
        if(clientSockets.length>0){
            broadcast(data);
        }
    });
    socket.on('end',()=>{
        console.log("ESP Disconnected!");
    });
    socket.on('close',(e)=>{
        console.log("ESP close! "+e);
    });
    socket.on('drain',()=>{
        console.log("ESP Nodata!");
    });
    socket.on('error',(e)=>{
        console.log(e);
    });
});
server.listen(process.env.WRITE_PORT, process.env.HOST);

const client = net.createServer((socket)=>{
    console.log('CLIENT CONNECT '+socket.remoteAddress+':'+socket.remotePort);
    socket.setKeepAlive(true,0);
    clientSockets.push(socket);
    socket.on('end', () => {
        // remove the client for list
        const index = clientSockets.indexOf(socket);
            if (index !== -1) {
                console.log('CLIENT DISCONNECT '+clientSockets[index].remoteAddress+':'+clientSockets[index].remotePort);
                clientSockets.splice(index, 1);
            }
    });
})
client.listen(process.env.READ_PORT, process.env.HOST);