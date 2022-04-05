const urlModel = require("../models/urlModel")
const shortid = require('shortid')


const baseUrl = ' http://localhost:3000'

let isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


const urlCreate = async function(req,res){
    try {
        let requestBody = req.body
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please Enter Details" })
        }
       
        const urlCode = shortid.generate()
        const shortUrl = baseUrl + '/' + urlCode

        const { longUrl } = requestBody

        if (!longUrl) { return res.status(400).send({ status: false, message: "LongUrl required" }) }
        
        const isValidLink =/(ftp|http|https|HTTP|HTTPS|FTP):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(longUrl.trim()) 
        if(!isValidLink){
            return res.status(400).send({ status: false, error: " Please provide valid URL" });

        }
        let lUrl = await urlModel.findOne({ longUrl })
        if (lUrl) {
            return res.status(200).send({ status: true, data: { longUrl: lUrl.longUrl, shortUrl: lUrl.shortUrl, urlCode: lUrl.urlCode } })
        }
        
        let urlData = {longUrl,shortUrl,urlCode}

        let data = await urlModel.create(urlData)
        return res.status(201).send({ status: true, data: { longUrl: data.longUrl, shortUrl: data.shortUrl, urlCode: data.urlCode } })

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



let getOriginalUrl=async function(req,res){
    try{
       
        let urlCode=req.params.urlCode

        if(!urlCode){return res.status(400).send({status:false,message:"urlCode Required"})}

         let findUrlCode=await urlModel.findOne({urlCode:urlCode})
         console.log(findUrlCode)
         
         if(!findUrlCode){return res.status(400).send({status:false,message:"urlCode not found"})}

         return res.status(302).redirect(findUrlCode.longUrl)
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}
  


    

module.exports.urlCreate = urlCreate
module.exports.getOriginalUrl=getOriginalUrl