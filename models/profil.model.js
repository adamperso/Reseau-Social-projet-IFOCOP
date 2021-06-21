const mongoose = require('mongoose')

var Schemademonprofil = new mongoose.Schema({
    pseudo: String
});

mongoose.model('profil', Schemademonprofil)