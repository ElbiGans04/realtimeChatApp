const express = require('express'),
      app = express(),
      http = require('http'),
      morgan = require('morgan'),
      port = process.env.PORT || 3000,
      server = http.createServer(app),
      io = require('socket.io')(server);

let userConnect = 0,
    user = {};

// Setup
app.set('views', './views');
app.set('view engine', 'pug');
app.use('/assets', express.static('./public'))
app.use('/socket', express.static('./node_modules/socket.io-client/dist/'))
app.use(morgan('dev'));

// Middleware yang akan dipanggil berurutan oleh socket io
io.use(function(socket, next){
    next()
});

// Routing
app.get('/', function(req, res){
    res.render('index')
});



// Event
io.on('connection', function(socket){
    userConnect++;
    user[socket.id] = {};
    
    socket.on('disconnect', function(){
        userConnect--;
        let allUser = '';

        // Ambil User
        for(let e in user) {
            if(e !== socket.id ) allUser += `${user[e].name} ,`    
        };

        socket.broadcast.emit('disconnectt', `${user[socket.id].name} telah keluar.`, true, allUser)
        delete user[socket.id];
    });

    socket.on('message', function(value, target){
        if(target.toLowerCase() == 'all') socket.broadcast.emit('new message', `${user[socket.id].name} : ${value}`);
        else {
            for(let e in user) {
                if(user[e].name == target) {
                    io.to(e).emit('new message', `${user[socket.id].name} : ${value}`)
                }
            }
        }

    });

    // Terima nama user
    socket.on('new user', function(name){
        user[socket.id] = {name};
        let allUser = '';

        // Ambil User
        for(let e in user) {
            allUser += `${user[e].name} ,`    
        };

        // Lancarkan Event
        io.emit('new user', ``, false, allUser);
        socket.broadcast.emit('new user', `${name} telah bergabung`, true, false);
    });

    // Event Saat ada yang klik input
    socket.on('focus', function(){
        socket.broadcast.emit('focus', `${user[socket.id].name} sedang mengetik`);
    });

    socket.on('blur', function(){
        socket.broadcast.emit('blur', ' ');
    });
});


server.listen(port, () => console.log(`Server Already Running in port ${port}`));