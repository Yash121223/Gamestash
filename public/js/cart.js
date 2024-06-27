function playClickSound() {
    var audio = document.getElementById('clickSound');
    audio.play();
}

const itemprice=document.querySelectorAll('.price');
let sum=0;
for (let i = 0; i < itemprice.length; i++) {
    const priceText = itemprice[i].textContent.replace('$', '');
    sum += parseFloat(priceText) || 0;
}


const itemdiscount=document.querySelectorAll('.discount');
let discount=0;
for (let i = 0; i < itemdiscount.length; i++) {
    const value = itemprice[i].textContent.replace('$', '');
    const priceText = itemdiscount[i].textContent.replace(/[^0-9.-]+/g, '');
    const finalvalue= (priceText*-1)*value/100;
    discount += parseFloat(finalvalue) || 0;
}

const cartprice=document.querySelector('#cartprice');
const cartdiscount=document.querySelector('#cartdiscount');
const cartotal=document.querySelector('#cartotal');

cartprice.innerText=`$`+sum;
cartdiscount.innerText=`$`+discount;
const total=sum-discount + 5;

cartotal.innerText=`$`+total;

const itemarr = Array.from(document.querySelectorAll('.itemnames')).map(item => item.textContent);
const quantity = Array.from(document.querySelectorAll('.quantitybox')).map(box => box.value);

document.querySelector('.place-order-button').addEventListener('click', function() {
    playClickSound();

    const orderData = {
        totalPrice: sum,
        discountPrice: discount,
        totalAmount: total,
        itemarr:itemarr,
        quantity:quantity
    };

    fetch('/user/placeOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        // Redirect to the new page with the order details
        window.location.href = `/user/orderConfirmation?totalPrice=${data.totalPrice}&discountPrice=${data.discountPrice}&totalAmount=${data.totalAmount}`;
    })
    .catch(error => {
        console.error('Error:', error);
    });
});


