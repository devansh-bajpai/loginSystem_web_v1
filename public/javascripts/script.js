const socket = io();
// const userData = JSON.stringify(fname);
socket.on('hey', (arg) => {
    console.log(userData);
})