const User = require('../models/User');
const Story = require('../models/Story');
const Discount = require('../models/Discount');
// CommonJS
const Swal = require('sweetalert2');

const {
    StatusCodes,
    PROXY_AUTHENTICATION_REQUIRED,
} = require('http-status-codes');
const BadRequestError = require('../errors/badRequestError');
const UnauthentiatedError = require('../errors/unauthenticatedError');
const NotFoundError = require('../errors/notFoundError');
const {createTokenUser, attachTokenToRes, Permission} = require('../utils');

const getAllUsers = async (req, res) => {
    console.log(req.user);
    const users = await User.find({role: 'user'}).select('-password');
    res.status(StatusCodes.OK).json({users});
};

const getSingleUser = async (req, res) => {
    console.log(req.params.id);
    const user = await User.findOne({_id: req.params.id}).select('-password');
    if (!user) {
        throw new NotFoundError(`No user with id : ${req.params.id}`);
    }
    Permission(req.user, user._id);
    res.status(StatusCodes.OK).json({user});
};

const showCurrentUser = async (req, res) => {
    const user = await User.findOne({_id: req.user.userId});
    res.status(StatusCodes.OK).render('account', {user: user, status: ''});
};

const updateUser = async (req, res) => {
    const {email, name, phone} = req.body;
    const user = await User.findById(req.user.userId);

    user.email = email ? email : user.email;
    user.name = name ? name : user.name;
    user.phone = phone ? phone : user.phone;
    await user.save();

    const tokenUser = createTokenUser(user);

    attachTokenToRes({res, user: tokenUser});

    res.render('account', {user: tokenUser, status: 'Cập nhật thành công!'});
};

const updateUserPassword = async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    console.log(oldPassword);

    const user = await User.findOne({_id: req.user.userId});
    console.log(user);
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        return res.render('account', {
            user: tokenUser,
            status: 'Mật khẩu không đúng!',
        });
    }
    user.password = newPassword;

    await user.save();
    const tokenUser = createTokenUser(user);

    res.render('account', {user: tokenUser, status: 'Cập nhật thành công!'});
};

const saveDiscount = async (req, res) => {
    const {id} = req.params;
    const user = await User.findOne({_id: req.user.userId});
    const allDiscount = await Discount.find({});
    const thisDiscount = await Discount.findOne({_id: id});
    var discount = user.discount;

    if (discount == undefined) {
        discount = [];
        discount[0] = thisDiscount.name;
        const newUser = await User.findByIdAndUpdate(
            {_id: req.user.userId},
            {discount: discount}
        );
    } else {
        let today = new Date();
        if (user.rank != thisDiscount.condition1) {
            res.render('searchDiscount', {
                discount: allDiscount,
                user: req.user,
                error: 'Bạn không thể sử dụng mã giảm giá này!',
                status: 1,
            });
            return;
        } else if (
            today > thisDiscount.endTime ||
            today < thisDiscount.startTime
        ) {
            res.render('searchDiscount', {
                discount: allDiscount,
                user: req.user,
                error: 'Mã giảm giá không trong thời gian sử dụng!',
                status: 1,
            });
            return;
        } else if (discount.includes(thisDiscount.name)) {
            res.render('searchDiscount', {
                discount: allDiscount,
                user: req.user,
                error: 'Bạn đã có mã giảm giá này!',
                status: 1,
            });
            return;
        }
        discount = [...discount, thisDiscount.name];
        const newUser = await User.findByIdAndUpdate(
            {_id: req.user.userId},
            {discount: discount}
        );
    }

    res.render('searchDiscount', {
        discount: allDiscount,
        user: req.user,
        error: 'Lưu mã giảm giá thành công!',
        status: 0,
    });
};

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
    saveDiscount,
};
