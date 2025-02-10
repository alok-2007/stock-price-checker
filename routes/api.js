'use strict';
const fetch = require('node-fetch');
const Stock = require('../model.js');

async function getStock(stock) {
  const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  const data = await response.json();
  return data;
}

function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

async function findStock(stock) {
  return await Stock.findOne({symbol: stock}).exec();
}

async function createStock(stock, like, ip) {
  const newStock = new Stock({
    symbol: stock,
    likes: like ? 1 : 0,
    likeby: like ? [ip] : [],
  });
  const result = await newStock.save();
  return result;
}

async function updatelike(stock, ip) {
  const result = await Stock.findOneAndUpdate(
    {symbol: stock, likeby: { $ne: ip}},
    {$inc: { likes: 1 }, $addToSet: {likeby: ip} },
    { new: true}
  ).exec();

  return result;
}



module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async (req, res) => {
      const { stock, like } = req.query;
      const ip = getClientIp(req);
      if (Array.isArray(stock)) {
        const response1 = await getStock(stock[0]);
        const response2 = await getStock(stock[1]);
        const find1 = await findStock(stock[0]);
        const find2 = await findStock(stock[1]);
        if (!find1) {
          const create1 = await createStock(stock[0], like, ip);
        } else {
          if (like) {
            const update1 = await updatelike(stock[0], ip);
          }
        }
        if (!find2) {
          const create2 = await createStock(stock[1], like, ip);
        } else {
          if (like) {
            const update1 = await updatelike(stock[1], ip);
          }
        }

        const stocklike1 = (await findStock(stock[0]))?.likes || 0;
        const stocklike2 = (await findStock(stock[1]))?.likes || 0;
        const final = {
          "stockData": [
            {"stock": response1.symbol, "price": Number(response1.latestPrice), "rel_likes": Number(stocklike1 - stocklike2)},
            {"stock": response2.symbol, "price": Number(response2.latestPrice), "rel_likes": Number(stocklike2 - stocklike1)}
          ]
        }
        res.json(final);
        console.log(final);
      } else {
        const response = await getStock(stock);
        const findStockresult = await findStock(stock);
        console.log('findStock',findStockresult);
        if (!findStockresult) {
          const createStockresult = await createStock(stock, like, ip);
          console.log('createStrock',createStockresult)
        } else {
          if (like) {
            const updatelikeresult = await updatelike(stock, ip);
            console.log('updatelike',updatelikeresult);
          }
        }
        const final_likes = (await findStock(stock))?.likes || 0;

        const final = {
          "stockData":
          {
            "stock": response.symbol,
            "price": Number(response.latestPrice),
            "likes": final_likes,
          }
        }
        res.json(final);
        console.log(final);
      }
    });
    
};