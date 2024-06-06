const express = require ('express')
const route = express()
const pool = require('../models/pool')
const body_parser = require('body-parser')

route.use(body_parser.urlencoded({
    extended:false

}))

route.use(body_parser.json())

route.post('/logged',(req,res)=>{
    const pid = req.body.username;
    pool.query(`select * from users where username = ? and password = ?`,[pid,req.body.password],(err,obj)=>{
        if(err){
            res.send(err)
        }
        else{
            if(obj.length==0){
                res.send('invalid credential')
            }
            else{
                req.session.username= obj[0].username
                res.redirect('/user/ps5')
            }
        }
    })
})

route.get('/ps5',(req,res)=>{
    if(req.session.username){
        pool.query(`select * from items` , (err,obj)=>{
            if(err){
                res.send(err)
            }
            else{
                res.render('ps5',{items:obj})
            }
        })
    }
    else{
        res.redirect('/login')
    }
})

route.post('/info',(req,res)=>{
    if(req.session.username){
        pool.query(`select * from items` , (err,obj)=>{
            if(err){
                res.send(err)
            }
            else{
                pool.query(`select * from items where item_name = ? `, [req.body.item_name], (err,data)=>{
                    if(err){
                        res.send(err)
                    }
                    else{
                        console.log(data)
                        console.log(req.body.item_name)
                        
                        res.render('itempage',{items:obj,product:data[0]})

                    }
                })
               

            }
        })
        
    }
    else{
        res.redirect('/login')
    }



})










module.exports = route;