const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();
const multer = require('multer')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any())


mongoose.connect("mongodb+srv://msatyam566:5RKuruCHR4gM2ZDi@cluster0.dqzcc.mongodb.net/myproject-url?retryWrites=true&w=majority", {
    useNewUrlParser: true,
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )



app.use('/', route);





app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});