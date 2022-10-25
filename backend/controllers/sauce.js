const Sauce = require('../models/Sauce');
const fs = require('fs');


exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};


exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }

    );
};


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,

        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],

        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Objet crée!' }) })
        .catch(error => { res.status(400).json({ error }) })
};


exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };


exports.likeSauce = (req, res, next) => {

    Sauce.findOne({ _id: req.params.id })

        .then((sauce) => {

            let voteValue;
            let user = req.body.userId;
            let upVote = sauce.usersLiked.includes(user);
            let downVote = sauce.usersDisliked.includes(user);

            // L'user a déja voté
            if (upVote === true) {
                voteValue = 1;
            } else if (downVote === true) {
                voteValue = -1;
            } else {
                voteValue = 0;
            }

            // L'user vote (actions possibles et effets)
            // L'user like
            if (voteValue === 0 && req.body.like === 1) {
                // On incrémente le total des like de 1
                sauce.likes += 1;
                // On met l'user dans le [] des like et il ne peut plus dislike, sauf s'il annule le like
                sauce.usersLiked.push(user);

                // Annulation du vote
            } else if (voteValue === 1 && req.body.like === 0) {
                // On retire 1 au score des likes
                sauce.likes -= 1;
                // Filter renvoi un [] sans notre user(effectivement effacé du [])
                const newUsersLiked = sauce.usersLiked.filter((f) => f != user);
                // MAJ []
                sauce.usersLiked = newUsersLiked;

            } else if (voteValue === -1 && req.body.like === 0) {
                sauce.dislikes -= 1;
                const newUsersDisliked = sauce.usersDisliked.filter((f) => f != user);
                sauce.usersDisliked = newUsersDisliked;

            } else if (voteValue === 0 && req.body.like === -1) {
                sauce.dislikes += 1;
                sauce.usersDisliked.push(user);

                // Pour tout autre vote, il ne vient pas du front donc probabilité de tentative de vote illégal
            } else {
                console.log("tentavive de vote illégal");
            }

            // MAJ du nombre de likes et [] de la sauce
            Sauce.updateOne(
                { _id: req.params.id },
                {
                    likes: sauce.likes,
                    dislikes: sauce.dislikes,
                    usersLiked: sauce.usersLiked,
                    usersDisliked: sauce.usersDisliked,
                }
            )
                .then(() => res.status(201).json({ message: 'Vous avez voté' }),
                    console.log("A voté!")
                )
                .catch(error => res.status(401).json({ error }))

        })

        .catch((error) => {
            res.status(400).json({ error });
        });
};


