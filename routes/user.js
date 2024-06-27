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
        console.log('funct started');
        pool.query(`SELECT * FROM items WHERE item_name = ?`, [req.body.item], (err, obj) => {
            if (err) {
                console.error("Error selecting item:", err);
                res.send("Error selecting item: " + err.message);
            } else {

                let data = obj[0];
                console.log(req.session.username);
                console.log(data);
                pool.query(`insert into cart (username, image, title, description, price, discount, quantity) 
                            VALUES (?, ?, ?, ?, ?, ?, 1) 
                            ON DUPLICATE KEY UPDATE  price=price/quantity,quantity = quantity + 1, price = price * (quantity)`, 
                            [req.session.username, data.image, data.item_name, data.description, data.price, data.discount], 
                            (err, obj1) => {
                    if (err) {
                        console.error("Error inserting into cart:", err);
                        res.send("Error inserting into cart: " + err.message);
                    } else {
                        console.log('data entered')
                        res.redirect('/user/cart');
                    }
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

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
        const da = req.body
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
`, [req.session.username, da.name, da.phone, da.email, da.pincode, da.locality, da.address, da.city, da.state, da.landmark], (err, obj) => {
            if (err)
                res.send(err);
            else {
                console.log('address submitted');
                res.redirect('/user/payment');
            }
        })
    } else {
        res.redirect('/login');
    }
})



route.get('/payment', (req, res) => {
    if (req.session.username) {
        res.render('payment');

    } else {
    }
})


route.post('/ordercomplete', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login');
    }

    const username = req.session.username;
    const query1 = `SELECT order_id FROM order_details WHERE username = ? ORDER BY order_id DESC LIMIT 1`;

    pool.query(query1, [username], (err, results) => {
        if (err) {
            return res.send(err);
        }

        if (results.length === 0) {
            return res.send('Order not found');
        }

        const orderId = results[0].order_id;

        const query2 = `UPDATE order_details SET status = 'Payment Done' WHERE order_id = ?`;

        pool.query(query2, [orderId], (err, result) => {
            if (err) {
                return res.send(err);
            }

            const query3 = `DELETE FROM cart WHERE username = ?`;

            pool.query(query3, [username], (err, result) => {
                if (err) {
                    return res.send(err);
                }

                const query4 = `
                    UPDATE items i
                    JOIN order_items oi ON i.item_name = oi.item_name
                    SET i.stock = i.stock - oi.quantity
                    WHERE oi.order_id = ?;
                `;

                pool.query(query4, [orderId], (err, result) => {
                    if (err) {
                        return res.send(err);
                    }

                    res.redirect('/user/myorders');
                });
            });
        });
    });
});





route.get('/myorders', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login');
    }

    const username = req.session.username;
    const query = `
        SELECT 
            od.order_id,
            od.order_date,
            od.status,
            od.total_amount,
            oi.item_name,
            oi.quantity,
            oi.price
        FROM 
            order_details od
        JOIN 
            order_items oi ON od.order_id = oi.order_id
        WHERE 
            od.username = ? AND od.status = 'Payment Done';
    `;

    pool.query(query, [username], (err, results) => {
        if (err) {
            return res.send(err);
        }

        const orders = results.reduce((acc, order) => {
            if (!acc[order.order_id]) {
                acc[order.order_id] = {
                    order_id: order.order_id,
                    order_date: order.order_date,
                    status: order.status,
                    total_amount: order.total_amount,
                    items: []
                };
            }
            acc[order.order_id].items.push({
                item_name: order.item_name,
                quantity: order.quantity,
                price: order.price
            });
            return acc;
        }, {});

        res.render('myorders', { orders: Object.values(orders) });
    });
});


route.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login');
    console.log(req.session.username);

});

module.exports = route;