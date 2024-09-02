const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', authController.postLogin);

//withMessage =>  검증에 실패했을 때 반환할 오류 메시지를 설정하는 데 사용
//isAlphanumeric =>  주어진 값이 알파벳과 숫자로만 구성되어 있는지 확인
router.post('/signup', check('email').isEmail().withMessage('Please Enter a Valid Email'),authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
