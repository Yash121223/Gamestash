const express = require ('express')
const route = express()
const pool = require('../models/pool')
const body_parser = require('body-parser')

route.use(body_parser.urlencoded({
    extended:false

}))

route.use(body_parser.json())


route.get('/login',(req,res)=>{
    res.render('adminlogin');
})


route.post('/logged',(req,res)=>{
    const pid = req.body.username;
    const pwd=req.body.password;

    if(pid=="admin"){
        if(pwd=="admin123"){
            req.session.username=pid;
            res.render('admin')
        }else{
            res.send("Password is wrong!")
        }
    }else{
        res.send('username is not valid!');
    }
        
})



module.exports = route;