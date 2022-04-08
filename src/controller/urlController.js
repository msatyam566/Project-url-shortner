const urlModel = require("../models/urlModel.js");
const redis = require("redis");
const shortid = require("shortid");

const { promisify } = require("util");

const redisClient = redis.createClient(
  16368,
  "redis-16368.c15.us-east-1-2.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("Y52LH5DG1XbiVCkNC2G65MvOFswvQCRQ", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//--------------------------------createUrl---------------------------------//


const createUrl = async function (req, res) {
  try {
    let data = req.body;
    let longUrl = req.body.longUrl;
    let baseUrl = "http://localhost:3000";

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Please provide some data" });
    }

    if (!longUrl)
     return res.status(400).send({ status: false, msg: " longUrl is required" });

    const isValidLink =/(ftp|http|https|HTTP|HTTPS|FTP):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(longUrl.trim() );

    if (!isValidLink) {return res.status(400).send({ status: false, error: " Please provide valid URL" });}

    //if valid we create the url code
    let urlCode = shortid.generate().toLowerCase();
    //join the generated short code in the base url
    let shortUrl = baseUrl + "/" + urlCode;

    let cacheData = await GET_ASYNC(`${longUrl}`);
    if (cacheData) {
      console.log("comming from the redis...");
      let convert = JSON.parse(cacheData);
      return res.status(200).send({ status: true, message: "Success", Data: convert });
    }
    let Url = await urlModel.findOne({ longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });

    if (Url) {
      await SET_ASYNC(`${longUrl}`, JSON.stringify(Url));
      return res.status(200).send({ status: true, data: Url });
    }
    let finalobject = { longUrl, shortUrl, urlCode };

    let saveddata = await urlModel.create(finalobject);
    res.status(201).send({  status: true,  msg: "URL created successfully", data: {longUrl: saveddata.longUrl,shortUrl: saveddata.shortUrl,urlCode: saveddata.urlCode,},});

  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};


//-----------------------------Get url code ---------------------------------------//


const getUrlcode = async function (req, res) {
  try {
    let urlCode = req.params.urlCode;

    let cacheData = await GET_ASYNC(`${urlCode}`);
    if (cacheData) {
      console.log("coming from redis...");
      let convert = JSON.parse(cacheData);
      return res.status(302).redirect(convert.longUrl);
    }
    let findUrlCode = await urlModel.findOne({ urlCode });
    console.log("Coming from DB....");
    await SET_ASYNC(`${urlCode}`, JSON.stringify(findUrlCode));

    if (!findUrlCode) {
      return res.status(400).send({ status: false, message: "urlCode not found" });
    }

    return res.status(302).redirect(findUrlCode.longUrl);
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports.createUrl = createUrl;
module.exports.getUrlcode = getUrlcode;
