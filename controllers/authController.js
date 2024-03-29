const User = require('../models/User');
const Product = require('../models/Product');
const Discount = require('../models/Discount');
const {StatusCodes} = require('http-status-codes');
const BadRequestError = require('../errors/badRequestError');
const UnauthentiatedError = require('../errors/unauthenticatedError');
const {attachTokenToRes, createTokenUser} = require('../utils');
const nodemailer = require('nodemailer');
const randomString = require('randomstring');


function difference(date1, date2) {
    const date1utc = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const date2utc = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    day = 1000 * 60 * 60 * 24;
    return (date2utc - date1utc) / day
}


const register = async (req, res) => {
    const {email, name, password, phone} = req.body;

    const emailExists = await User.findOne({email});
    if (emailExists) {
        res.render('auth/register', {
            user: req.user,
            warning: 'Email đã được sử dụng, vui lòng thử email khác!',
        });
        return;
    }

    const isFirstAccount = (await User.countDocuments({})) == 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({name, email, password, role, phone});
    await user.save();

    let productNew = await Product.find({}).sort({_id: -1});
    let caPhe = await Product.find({category: 'Cà phê'}).sort({_id: -1});
    let traSua = await Product.find({category: 'Trà trái cây-Trà sữa'}).sort({
        _id: -1,
    });
    let daXay = await Product.find({category: 'Đá xay-Choco-Matcha'}).sort({
        _id: -1,
    });
    let doUongNhanh = await Product.find({category: 'Đồ uống nhanh'}).sort({
        _id: -1,
    });
    let drinks = await Product.find({category: 'Drinks'}).sort({_id: -1});

    productNew = productNew.slice(0, 3);
    caPhe = caPhe.slice(0, 3);
    traSua = traSua.slice(0, 3);
    daXay = daXay.slice(0, 3);
    drinks = drinks.slice(0, 3);
    doUongNhanh = doUongNhanh.slice(0, 3);

    productNew = productNew.slice(0, 3);
    caPhe = caPhe.slice(0, 3);
    traSua = traSua.slice(0, 3);
    daXay = daXay.slice(0, 3);
    drinks = drinks.slice(0, 3);
    doUongNhanh = doUongNhanh.slice(0, 3);

    // push data numbers to index page
    let beginDate = new Date("2021-10-7");
    let today = new Date();
    let numbersOfUsers = 0;
    let numbersOfDiscount = 0;
    let dayServed = difference(beginDate, today);
    let monthServed = dayServed / 30 + 1;
    const users = await User.find({});
    console.log(today);
    users.forEach(function (e) {
        if (e.score > 0) {
            numbersOfUsers += 1;
        }
    })
    const discounts = await Discount.find({});
    discounts.forEach(function (e) {
        if (e.endTime > Date.now()) {
            numbersOfDiscount += 1;
        }
    })

    res.clearCookie('token');
    res.status(StatusCodes.CREATED).render('index', {
        user: '',
        productNew: productNew,
        caPhe: caPhe,
        traSua: traSua,
        daXay: daXay,
        doUongNhanh: doUongNhanh,
        drinks,
        drinks,
        status: '',
        numbersOfDiscount,
        numbersOfUsers,
        dayServed,
        monthServed,
    });
};

const login = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        res.render('auth/login', {
            user: req.user,
            warning: 'Vui lòng nhập email hoặc mật khẩu!',
        });
        return;
    }

    user = await User.findOne({email});
    if (!user) {
        res.render('auth/login', {
            user: req.user,
            warning: 'Tài khoản không tồn tại!',
        });
        return;
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        res.render('auth/login', {
            user: req.user,
            warning: 'Mật khẩu không đúng!',
        });
        return;
    }

    let productNew = await Product.find({}).sort({_id: -1});
    let caPhe = await Product.find({category: 'Cà phê'}).sort({_id: -1});
    let traSua = await Product.find({category: 'Trà trái cây-Trà sữa'}).sort({
        _id: -1,
    });
    let daXay = await Product.find({category: 'Đá xay-Choco-Matcha'}).sort({
        _id: -1,
    });
    let doUongNhanh = await Product.find({category: 'Đồ uống nhanh'}).sort({
        _id: -1,
    });
    let drinks = await Product.find({category: 'Drinks'}).sort({_id: -1});

    productNew = productNew.slice(0, 3);
    caPhe = caPhe.slice(0, 3);
    traSua = traSua.slice(0, 3);
    daXay = daXay.slice(0, 3);
    drinks = drinks.slice(0, 3);
    doUongNhanh = doUongNhanh.slice(0, 3);


    // push data numbers to index page
    let beginDate = new Date("2021-10-7");
    let today = new Date();
    let numbersOfUsers = 0;
    let numbersOfDiscount = 0;
    let dayServed = difference(beginDate, today);
    let monthServed = dayServed / 30 + 1;
    const users = await User.find({});
    console.log(today);
    users.forEach(function (e) {
        if (e.score > 0) {
            numbersOfUsers += 1;
        }
    })
    const discounts = await Discount.find({});
    discounts.forEach(function (e) {
        if (e.endTime > Date.now()) {
            numbersOfDiscount += 1;
        }
    })

    const tokenUser = createTokenUser(user);
    attachTokenToRes({res, user: tokenUser});
    res.status(StatusCodes.OK).render('index', {
        user: tokenUser,
        productNew: productNew,
        caPhe: caPhe,
        traSua: traSua,
        daXay: daXay,
        doUongNhanh: doUongNhanh,
        drinks,
        drinks,
        status: '',
        numbersOfDiscount,
        numbersOfUsers,
        dayServed,
        monthServed,
    });
};

const logout = async (req, res) => {
    // res.cookie('token', 'logout', {
    //   httpOnly: true,
    //   expires: new Date(Date.now() + 500),
    // });
    res.clearCookie('token');
    res.status(StatusCodes.OK).redirect('/');
};

const forgotPassword = async (req, res) => {
    const email = req.body.email;
    const newPassword = randomString.generate(8);
    console.log(newPassword);
    if (!email) {
        res.render('auth/forgot-password', {
            user: req.user,
            warning: 'Vui lòng nhập email!',
        });
        return;
    }
    user = await User.findOne({email});
    if (!user) {
        res.render('auth/forgot-password', {
            user: req.user,
            warning: 'Không tồn tại tài khoản với email này!',
        });
        return;
    }
    user.password = newPassword;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });
    const mailOptions = {
        from: '"Illuminate Coffee Shop" <illuminate.coffee@outlook.com>',
        to: email,
        subject: 'Thiết lập lại mật khẩu!',
        html: '<b>Mật khẩu mới: </b>' + newPassword,
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('Sent: ' + info.response);
    });
    res.status(StatusCodes.OK).redirect('/auth');
};

module.exports = {register, login, logout, forgotPassword};
