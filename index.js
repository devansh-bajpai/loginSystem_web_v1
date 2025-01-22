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


// To log connection message

// io.on('connection', (socket) => {
//     console.log('a user connected');
//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//       });
// });

const all_errors_nulled = {account_exist: null, right_pass: null, signupSuccess: null, already_exists: null, passLen_error: null, notconfirm_pass: null};

let generateError = (e, setVal) => {
    const newObj = Object.assign({}, all_errors_nulled);
    newObj[e] = setVal;
    return newObj;
}

app.get('/', (req, res) => {
    let cookieData = req.cookies;
    if (Object.keys(cookieData).length > 0){
        res.cookie('all_errors', all_errors_nulled);
        res.render('index', cookieData.all_errors);
    }
    else {
        res.cookie('all_errors', all_errors_nulled);
        res.render('index', all_errors_nulled);
    }

})

app.get('/signup', (req, res) => {
    let cookieData = req.cookies;
    if (Object.keys(cookieData).length > 0){
        res.cookie('all_errors', all_errors_nulled);
        res.render('signup', cookieData.all_errors);
    }
    else {
        res.cookie('all_errors', all_errors_nulled);
        res.render('signup', all_errors_nulled);
    }
})

app.post('/submitsignup', async (req, res) => {
    
    if(req.body.password.length >=8){

        let userData = await person.findOne({email: req.body.email});
        if (userData == null) {

            if (req.body.password == req.body.ConfirmPassword){
    
                // console.log(req.body);
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(req.body.password, salt);
                let personDetails = await person.create({
                    email: req.body.email,
                    password: hash
                })
        
                res.cookie('all_errors', generateError('signupSuccess', true));
                res.redirect('/');
            }
            else {
                res.cookie('all_errors', generateError('notconfirm_pass', true));
                res.redirect('/signup');
            }
        }
        else {
            console.log('User Already Exists');
            res.cookie('all_errors', generateError('already_exists', true));
            res.redirect('/signup');
        }




    }
    
    else {
        res.cookie('all_errors', generateError('passLen_error', true));
        res.redirect('/signup');
    }

    
})

app.post('/submit', async (req, res) => {
    
    personDetails = await person.findOne({email: req.body.email});
    if (personDetails != null){
        if (bcrypt.compareSync(req.body.password, personDetails.password)){
            res.render('loggedin');
        }
        else {
            res.cookie('all_errors', generateError('right_pass', false));
            res.redirect('/');
        }
        
    }
    else {
        res.cookie('all_errors', generateError('account_exist', false));
        res.redirect('/');
    }

})

server.listen(3000, () => {
    console.log('App is Listening on PORT 3000');
})