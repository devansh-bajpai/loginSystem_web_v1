const express = require('express');
const app = express();
const { createServer } = require('node:http');
const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server);

const path = require('path');
const cookieParser = require('cookie-parser');

var bcrypt = require('bcryptjs');

const person = require('./models/person.js');


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });
});


app.get('/', (req, res) => {
     res.render('index', {account_exist : true, right_pass : true});
})

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.post('/submitsignup', async (req, res) => {
    
    if(req.body.password.length >=8){

        if (req.body.password == req.body.ConfirmPassword){

            console.log(req.body);
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(req.body.password, salt);
            let personDetails = await person.create({
                email: req.body.email,
                password: hash
            })
            
            res.redirect('/');
        }
        else {
            res.redirect('/');
        }

    }
    
    else {
        res.redirect('/');
    }

    
})

app.post('/submit', async (req, res) => {

    personDetails = await person.findOne({email: req.body.email});
    if (personDetails != null){
        if (bcrypt.compareSync(req.body.password, personDetails.password)){
            console.log('Logged in successfully!');
            res.render('loggedin');
        }
        else {
            console.log('incorrect password');
            res.redirect('/login/wrong_pass');
        }
        
    }
    else {
        console.log('Account does not exist');
        res.redirect('/login/account_not_exist');
    }

})


app.get('/login/account_not_exist', (req, res) => {
    res.render('index', {account_exist : false, right_pass: true});
})

app.get('/login/wrong_pass', (req, res) => {
    res.render('index', {account_exist : true, right_pass: false});
})

server.listen(3000, () => {
    console.log('App is Listening on PORT 3000');
})