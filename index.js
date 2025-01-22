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

const all_errors_nulled = {account_exist: null, right_pass: null, signupSuccess: null, already_exists: null, passLen_error: null, notconfirm_pass: null};

let generateError = (e, setVal) => {
    const newObj = Object.assign({}, all_errors_nulled);
    newObj[e] = setVal;
    return newObj;
}

app.get('/', (req, res) => {
    let cookieData = req.cookies;
    // console.log(cookieData);
    // console.log(typeof cookieData);
    // console.log(Object.keys(cookieData).length);
    if (Object.keys(cookieData).length > 0){
        res.cookie('all_errors', all_errors_nulled);
        res.render('index', cookieData.all_errors);
    }
    else {
        res.cookie('all_errors', all_errors_nulled);
        res.render('index', all_errors_nulled);
    }
    
    //  res.render('index', {account_exist : true, right_pass : true, signupSuccess: false});
    //  console.log(req.cookies);
})

app.get('/signup', (req, res) => {
    // res.render('signup', {already_exists: null, passLen_error: null, notconfirm_pass: null});
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
    
                console.log(req.body);
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(req.body.password, salt);
                let personDetails = await person.create({
                    email: req.body.email,
                    password: hash
                })
                
                // res.redirect('/login/acc_created');
                // res.cookie('all_errors', {account_exist: null, right_pass: null, signupSuccess: true});
                res.cookie('all_errors', generateError('signupSuccess', true));
                res.redirect('/');
            }
            else {
                // res.redirect('/signup/notconfirm_pass');
                // res.cookie('all_errors', {already_exists: null, passLen_error: null, notconfirm_pass: true});
                res.cookie('all_errors', generateError('notconfirm_pass', true));
                res.redirect('/signup');
            }
        }
        else {
            console.log('User Already Exists');
            // res.redirect('/signup/already_exists');
            // res.cookie('all_errors', {already_exists: true, passLen_error: null, notconfirm_pass: null});
            res.cookie('all_errors', generateError('already_exists', true));
            res.redirect('/signup');
        }




    }
    
    else {
        // res.redirect('/signup/passLen_error');

        // res.cookie('all_errors', {already_exists: null, passLen_error: true, notconfirm_pass: null})
        res.cookie('all_errors', generateError('passLen_error', true));
        res.redirect('/signup');
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
            // res.redirect('/login/wrong_pass');
            // res.cookie('all_errors', {account_exist: null, right_pass: false, signupSuccess: null})
            res.cookie('all_errors', generateError('right_pass', false));
            res.redirect('/');
        }
        
    }
    else {
        console.log('Account does not exist');
        // res.redirect('/login/account_not_exist');
        // res.cookie('all_errors', {account_exist: false, right_pass: null, signupSuccess: null});
        res.cookie('all_errors', generateError('account_exist', false));
        res.redirect('/');
    }

})


// app.get('/login/:routename', (req, res) => {
//     // res.render('index', {account_exist : false, right_pass: true, signupSuccess: false});
//     if (req.params.routename == "wrong_pass") {
//         res.cookie('all_errors', {account_exist: null, right_pass: false, signupSuccess: null})
//         res.redirect('/login');
//         // res.render('index', {account_exist: null, right_pass: false, signupSuccess: null});
//     }
//     else if (req.params.routename == "account_not_exist"){
//         res.cookie('all_errors', {account_exist: false, right_pass: null, signupSuccess: null});
//         res.redirect('/login');
//         // res.render('index', {account_exist: false, right_pass: null, signupSuccess: null});
//     }
//     else if (req.params.routename == "acc_created"){
//         res.cookie('all_errors', {account_exist: null, right_pass: null, signupSuccess: true});
//         res.redirect('/login');
//         // res.render('index', {account_exist: null, right_pass: null, signupSuccess: true});
//     }



// })

// app.get('/login/wrong_pass', (req, res) => {
//     res.render('index', {account_exist : true, right_pass: false, signupSuccess: false});
// })

// app.get('/signup/:routename', (req, res) => {
//     // res.render('signup', {passLen_error: true, passConfirm: false})
//     if (req.params.routename == "already_exists") {
//         // res.render('signup', {already_exists: true, passLen_error: null, notconfirm_pass: null});
//         res.cookie('all_errors', {already_exists: true, passLen_error: null, notconfirm_pass: null});
//         res.redirect('/signup');
        
//     }
//     else if (req.params.routename == "passLen_error"){
//         // res.render('signup', {already_exists: null, passLen_error: true, notconfirm_pass: null});
//         res.cookie('all_errors', {already_exists: null, passLen_error: true, notconfirm_pass: null})
//         res.redirect('/signup');
//     }
//     else if (req.params.routename == "notconfirm_pass"){
//         // res.render('signup', {already_exists: null, passLen_error: null, notconfirm_pass: true});
//         res.cookie('all_errors', {already_exists: null, passLen_error: null, notconfirm_pass: true});
//         res.redirect('/signup');
//     }



// })

server.listen(3000, () => {
    console.log('App is Listening on PORT 3000');
})