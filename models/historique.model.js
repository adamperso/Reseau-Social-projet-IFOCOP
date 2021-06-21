const mongoose = require('mongoose');

var Monschema = new mongoose.Schema({
    
    sender: String,
    receiver: String,
    content: String
    

});

mongoose.model('historique', Monschema);