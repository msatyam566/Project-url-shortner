const mongoose = require('mongoose')



const urlSchema = new mongoose.Schema({

    urlCode :{ type: String, unique: true,  trim : true, required: true},
    longUrl:{type:String, required: true, match:[/(ftp|http|https|HTTP|HTTPS|FTP):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/]},
    shortUrl:{type:String,unique: true, required: true}

}, {timestamps:true})


module.exports= mongoose.model('url',urlSchema)