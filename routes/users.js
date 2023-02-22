const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');

const { auth } = require('../middleware/auth');


router.post('/register', userController.newUser);

router.post('/activate', userController.activateUser);

router.post('/login', userController.loginUser);

router.post('/refresh', userController.refreshTokenUser);

router.get('/logout', userController.logoutUser);

router.get('/profile/:_id', auth, userController.getUser);

router.get('/list', auth, userController.getUsers);

router.put('/update/:_id', auth, userController.updateUser);

router.delete('/delete/:_id', auth, userController.deleteUser);


module.exports = router;
