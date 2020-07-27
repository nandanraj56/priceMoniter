const express = require('express');
const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ 
  extended: true
}));
app.post('/start', function(req,res){ 
  var link = req.body.link; 
  var selector1 =req.body.selector; 
  var price = req.body.price; 
  
  processStart(link,price,selector1);
  
        
  return res.redirect('success.html'); 
}) 
app.get('/stop', function(req,res){ 
  
  processStop();
  
        
  return res.redirect('index.html'); 
})
app.listen(3000);



//Obtain HTML of page
const axios = require('axios');
async function getHTML(url) {
  const { data: html } = await axios.get(url).catch(() => {
    console.log("Couldn't get the page ☹️");
  });
  //console.log("hello");
  return html;
}

//Selecting price with Chereo
const cheerio = require('cheerio');
/* ...*/
function scrapPrice(html,selector) {


  const $ = cheerio.load(html); //First you need to load in the HTML
  const price = $(selector)
    .text() // we get the text
    .trim();

  //console.log(price);
  return price;
}

//Converting string price to number
const currencyStringToNumber = (currency) => Number(currency.replace(/[^0-9.-]+/g, ''));
const cron = require('node-cron');

/* .Scheduling job every minute. */
//Main starting point
var sendingJob;
const processStart = (productPage,desiredPrice,selector)=>{
  console.log('process started');
  sendingJob = cron.schedule('* * * * *', async () => {
    console.log('running a task every min ⏲️');
    //console.log(productPage);
    const html = await getHTML(productPage).catch(console.log);
    const currentPrice = currencyStringToNumber(scrapPrice(html,selector));
    console.log(currentPrice);
    if (currentPrice < desiredPrice) {
      sendMail();
      
    }
  });
}
const processStop =()=>{
  sendingJob.stop();
  sendingJob.destroy();
  console.log("stopped");

}


//Triggring Email
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: 'zoila.jaskolski84@ethereal.email',
    pass: 'KJKBeVRqpfS4kbTBPW'
  }
});

var mailOptions = {
  from: 'zoila.jaskolski84@ethereal.email',
  to: 'lindsey.keeling@ethereal.email', //password JFqM3UKc9VNqAxxGKZ
  subject: 'Price of your item have just been lowered',
  text: 'Congratulations! you just saved some bucks !'
};
const sendMail = () => {
  
  transporter.sendMail(mailOptions, function (error, info) {
    processStop();
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

};
