const express = require('express');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));


const productPage = 'https://www.amazon.in/Samsung-Galaxy-Ocean-128GB-Storage/dp/B07HGGYWL6/ref=lp_17033333031_1_1?s=electronics&ie=UTF8&qid=1595054432&sr=1-1';
const desiredPrice = 18000;
const selector = '#priceblock_dealprice';

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
function scrapPrice(html) {


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
const sendingJob = cron.schedule('* * * * *', async () => {
  console.log('running a task every min ⏲️');
  const html = await getHTML(productPage).catch(console.log);
  const currentPrice = currencyStringToNumber(scrapPrice(html));
  console.log(currentPrice);
  if (currentPrice < desiredPrice) {
    sendMail();
    
  }
});

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
  sendingJob.stop();
  sendingJob.destroy();
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

};
