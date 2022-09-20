const mongoose = require('mongoose');
const express = require('express');

const userRoutes = require('./routes/user');

mongoose.connect('mongodb+srv://tbonnefilleOCR:HtgP2B7U3ivANBE@cluster0.o70wrhv.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();


app.use((req, res) => {
    res.json({ message: 'Votre requête a bien été reçue !' });
});


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});


app.use('/api/auth', userRoutes);


module.exports = app;