const express = require('express');
const { check , body } = require('express-validator');

const authController = require('../controllers/auth');

const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

//withMessage =>  검증에 실패했을 때 반환할 오류 메시지를 설정하는 데 사용
//isAlphanumeric =>  주어진 값이 알파벳과 숫자로만 구성되어 있는지 확인
router.post('/signup', [
    check('email')
    .isEmail()
    .withMessage('Please Enter a Valid Email')
    .custom((value, {req}) => {
        // if(value === 'test@test.com') {
        //     throw new Error('This Email is Forbiiden');
        // }
        // return true;
       return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-Mail exists already, please pick a different one.');
                }
        });
    }),
    body('password' ,'Please enter a password with only numbers and text and at Least 5 charachters')
    .isLength({min: 5})
    .isAlphanumeric(),
    body('confirmPassword').custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('password have to match');
        }
        return true;
    })
],authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
