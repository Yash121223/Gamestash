const express = require('express')
const route = express()
const pool = require('../models/pool')
const body_parser = require('body-parser')

// for image will go in admin part
// const { v4: uuid, parse } = require('uuid')
// const multer = require('multer');
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./public/files");
//     },
//     filename: function (req, file, cb) {
//         let ext = file.originalname.split(".");
//         ext = ext[ext.length - 1];

//         let filename = uuid() + "." + ext;
//         req.FileName = filename;
//         cb(null, filename);
//     },
// });
// const upload = multer({ storage: storage })

route.use(body_parser.urlencoded({
    extended: false

}))

route.use(body_parser.json())

route.post('/logged', (req, res) => {
    const pid = req.body.username;
    pool.query(`select * from users where username = ? and password = ?`, [pid, req.body.password], (err, obj) => {
        if (err) {
            res.send(err)
        }
        else {
            if (obj.length == 0) {
                res.send('invalid credential')
            }
            else {
                req.session.username = obj[0].username
                res.redirect('/user/ps5')
            }
        }
    })
})



route.get('/ps5', (req, res) => {
    if (req.session.username) {
        pool.query(`select * from items`, (err, obj) => {
            if (err) {
                res.send(err)
            }
            else {
                res.render('ps5', { items: obj })
            }
        })
    }
    else {
        res.redirect('/login')
    }
})

route.post('/info', (req, res) => {
    if (req.session.username) {
        pool.query(`select * from items`, (err, obj) => {
            if (err) {
                res.send(err)
            }
            else {
                pool.query(`select * from items where item_name = ? `, [req.body.item_name], (err, data) => {
                    if (err) {
                        res.send(err)
                    }
                    else {

                        if (data[0].stock == 0)
                            res.render('itempage', { items: obj, product: data[0], stk: "Out of Stock" });
                        else {
                            res.render('itempage', { items: obj, product: data[0], stk: data[0].stock });
                        }


                    }
                })


            }
        })

    }
    else {
        res.redirect('/login')
    }



})

route.get('/wishlist', (req, res) => {
    if (req.session.username) {
        pool.query(`select * from wishlist where username = ?`, [req.session.username], (err, data) => {
            if (err)
                res.send(err);
            else {
                res.render('wishlist', { wishes: data });
            }
        })
    } else {
        res.redirect('/login');
    }
})


route.post('/wishlistadd', (req, res) => {
    if (req.session.username) {
        pool.query(`select * from items where item_name = ? `, [req.body.item_name], (err, data) => {
            if (err) {
                res.send(err)
            }
            else {

                pool.query(`insert into wishlist (username, item_name, image, description, price) values(?,?,?,?,?)`, [req.session.username, data[0].item_name, data[0].image, data[0].description, data[0].price], (err, obj) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.redirect('/user/wishlist');
                    }
                })

            }
        })
    } else {
        res.redirect('/login')
    }
})


route.post('/wishlistdelete', (req, res) => {
    if (req.session.username) {
        pool.query(`delete from wishlist where username = ? and item_name = ?`, [req.session.username, req.body.item], (err, obj) => {
            if (err)
                res.send(err)
            else {
                res.redirect('/user/wishlist');
            }
        })
    } else {
        res.redirect('/login');
    }
})

route.get('/cart', (req, res) => {
    if (req.session.username) {
        pool.query(`select * from cart where username = ? `, [req.session.username], (err, obj) => {
            if (err)
                res.send(err)
            else {
                res.render('cart', { data: obj });

            }
        })
    } else {
        res.redirect('/login');
    }
})

route.post('/cartadd', (req, res) => {
    if (req.session.username) {
        pool.query(`select * from items where item_name = ?`, [req.body.item], (err, obj) => {
            if (err)
                res.send(err);
            else {
                let data = obj[0];

                pool.query(`INSERT INTO cart (username, image, title, description, price, discount, quantity) VALUES (?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1, price = price * (quantity); `, [req.session.username, data.image, data.item_name, data.description, data.price, data.discount], (err, obj1) => {
                    if (err) {
                        res.send(err);
                    } else {
                        res.redirect('/user/cart');
                    }
                })
            }
        })
    } else {
        res.redirect('/login');
    }
})

route.get('/quaadd', (req, res) => {
    if (req.session.username) {
        pool.query(`UPDATE cart
SET price = price / (quantity ) , quantity = quantity + 1,
    price = price * (quantity ) 
WHERE title = ? and username = ?;
`, [req.query.title1, req.session.username], (err, obj) => {
            if (err)
                res.send(err);
            else
                res.redirect('/user/cart');
        })
    }
    else {
        res.redirect('/login');
    }
})

route.get('/quadif', (req, res) => {
    if (req.session.username) {
        pool.query(`UPDATE cart
SET price = price / (quantity ) , quantity = quantity - 1,
    price = price * (quantity ) 
WHERE title = ? and username = ?;
`, [req.query.title1, req.session.username], (err, obj) => {
            if (err)
                res.send(err);
            else
                res.redirect('/user/cart');
        })
    }
    else {
        res.redirect('/login');
    }
})

route.get('/cartdelete', (req, res) => {
    if (req.session.username) {
        pool.query(`delete from cart where title =? and username = ?`, [req.query.title1, req.session.username], (err, obj) => {
            if (err)
                res.send(err)
            else
                res.redirect('/user/cart');
        })
    }
    else {
        res.redirect('/login');
    }
})


route.post('/placeOrder', (req, res) => {
    const { totalPrice, discountPrice, totalAmount, itemarr, quantity } = req.body;

    const query1 = `INSERT INTO order_details (username, total_amount) VALUES (?, ?)`;

    pool.query(query1, [req.session.username, totalAmount], (err, obj) => {
        if (err) {
            console.error('Error inserting order details:', err);
            return res.status(500).send('Error inserting order details');
        } else {
            const orderId = obj.insertId;
            
            
            const orderItems = itemarr.map((item, index) => [orderId, item, quantity[index]]);
           
            
            const query2 = `INSERT INTO order_items (order_id, item_name, quantity) VALUES ?`;

            pool.query(query2, [orderItems], (err, result2) => {
                if (err) {
                    console.error('Error inserting order items:', err);
                    return res.status(500).send('Error inserting order items');
                } else {
                    console.log('Data submitted successfully');
                    res.json({
                        totalPrice: totalPrice,
                        discountPrice: discountPrice,
                        totalAmount: totalAmount,
                        itemarr: itemarr,
                        quantity: quantity
                    });
                }
            });
        }
    });
});


route.get('/orderConfirmation', (req, res) => {
    if (req.session.username) {
        const { totalPrice, discountPrice, totalAmount } = req.query;
        res.render('address', { price: totalPrice, discount: discountPrice, amount: totalAmount });

    } else {
        res.redirect('/login');
    }


});

route.post('/orderdone', (req, res) => {
    if (req.session.username) {
        console.log('form1 done');
        const da=req.body
        pool.query(`INSERT INTO user_info (username, name, phone, email, pincode, locality, address, city, state, landmark)
VALUES (?,?,?,?,?,?,?,?,?,?)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    phone = VALUES(phone),
    email = VALUES(email),
    pincode = VALUES(pincode),
    locality = VALUES(locality),
    address = VALUES(address),
    city = VALUES(city),
    state = VALUES(state),
    landmark = VALUES(landmark);
`,[req.session.username, da.name,da.phone,da.email,da.pincode,da.locality,da.address,da.city,da.state,da.landmark],(err,obj)=>{
    if(err)
        res.send(err);
    else{
        res.redirect('/user/payment');
    }
})
    }else{
        res.redirect('/login');
    }
})

route.post('/orderdetailadd',(req,res)=>{
    console.log('form 2 done')
})

route.post('/payment', (req, res) => {
    res.render('payment');
})








module.exports = route;