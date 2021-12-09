'use strict'
var bcrypt = require('bcrypt-nodejs');
const user = require('../models/user');
var User = require('../models/user');
var jwt = require('../services/jwt')

function pruebas(req, res) {
    res.status(200).send({
        message: 'Probando una accion del controlador del usuarios del api rest con Node y Mongo'
    });

}

function saveUser(req, res) {
    var user = new User();

    var params = req.body;

    console.log(params);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_ADMIN';
    user.image = 'null';

    if (params.password) {
        //Encriptar contraseña y guardar datos
        bcrypt.hash(params.password, null, null, function(err, hash) {
            user.password = hash;

            if (user.name != null && user.surname != null && user.email != null) {
                // Guardar el usuario
                user.save((err, userStored) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al guardar usuario.' });
                    } else {
                        if (!userStored) {
                            res.status(404).send({ message: 'No se ah registrado el usuario' });
                        } else {
                            res.status(200).send({ user: userStored });
                        }
                    }
                });
            } else {
                res.status(200).send({ message: 'Rellena todos los campos.' });
            }
        });
    } else {
        res.status(200).send({ message: 'Introduce la contraseña.' })
    }
}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'Error en la petición.' });
        } else {
            if (!user) {
                res.status(404).send({ message: 'El usuario no existe.' });
            } else {
                // Comprobar la contraseña
                bcrypt.compare(password, user.password, function(err, check) {
                    if (check) {
                        //devolver los datos del usuario logueado
                        if (params.gethash) {
                            //devolver un token de jwt
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {
                            res.status(200).send({ user });
                        }
                    } else {
                        res.status(404).send({ message: 'El usuario no ha podido loguearse.' });
                    }
                });
            }
        }
    })

}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, (err, userUpdate) => {
        if (err) {
            res.status(500).send({ message: 'Error al actualizar el usuario.' });
        } else {
            if (!userUpdate) {
                res.status(404).send({ message: 'No se ha podido actualizar el usuario.' });
            } else {
                res.status(200).send({ user: user.Updated });
            }
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser
};