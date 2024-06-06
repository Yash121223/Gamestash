const express = require ('express')
const app = express()
const port = 4000
const path = require('path')
const user = require('./routes/user')
const admin = require('./routes/admin')
const pool = require('./models/pool')
const body_parser = require('body-parser')
const session = require('express-session')

app.use(session({
    secret:'panda',
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:3600000*5}
}))

app.use(body_parser.urlencoded({
    extended:false

}))

app.use(body_parser.json())

app.use(express.static('public'))
const hbs = require('hbs')

app.set('view engine','hbs')

// uncommnet karna jab user aur admin ki js likhenge
app.use('/user',user)
// app.use('/admin',admin)

app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/navbar',(req,res)=>{
    res.render('navbar')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/signup',(req,res)=>{
    res.render('signup')
    
})

app.get('/cart',(req,res)=>{
    res.render('cart')
    
})

// app.get('/itempage',(req,res)=>{
//     res.render('itempage')
    
// })

// app.get('/ps5',(req,res)=>{
//     res.render('ps5 disc')
    
// })



app.post('/signed',(req,res)=>{
    const text = req.body;
    
    if(text.password==text.repassword){
        pool.query(`INSERT INTO users (username,name,password) values (?,?,?)` , [text.username, text.name, text.password],(err,obj)=>{

            if(err){
                res.send('username already exist!')
            }
            else{
                res.send('user registerd')
            }

        })
    }
    else{
        res.send('password dont match!')
    }
}) 

app.listen(port,()=>{
    console.log("server connected")
})

