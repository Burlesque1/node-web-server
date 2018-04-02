// for test purpose
require('./config/config')


const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const moment = require('moment');
const _ = require('lodash');
const validator = require('validator');

var {mongoose} = require('./db/mongoose');
var {authenticate} = require('./middleware/authenticate');
var {User} = require('./models/user');

const port = process.env.PORT;

var app = express();

// --------------------------------------------------------------------------???
hbs.registerPartials('C:\\Users\\Omelet\\Desktop\\Node\\R8\\views\\partials');
// --------------------------------------------------------------------------???
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});
hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});
app.set('view engine', 'hbs');


// views should be put in the same dir with node_modules
// app.use((req, res, next) => {
//     res.render('maintenance.hbs');
// });

// static serves static files and uses complete path
// public should include pages except index.html
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended: true}));
// app.use((req, res, next) => {
//     var now = new Date().toString();
//     console.log(`${now} ${req.method} ${req.url}`);
//     next();
// });

app.get('/', (req, res) => {
    res.render('home.hbs', {
      pageTitle: 'Home Page',
      welcomeMessage: 'Welcome to my website'
    });
});

app.post('/room', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    console.log(body, typeof body)
    try{
        if(!validator.isEmail(body.email) || body.password.length < 6){
            
            // pop up here

            throw new Error('not email or password too short');      
        }
        var user = await User.findByCredentials(body.email, body.password);
        var token = await user.generateAuthToken();
        // res.header('x-auth', token).send(user); // ??????????????
        res.render('room.hbs');
    } catch(e){
        console.log(e.message);
        res.status(400).redirect('/');
    }
})
app.listen(port, () => {
    console.log(`Started up at port ${port} at ${moment()}`);
})

module.exports = {app};