const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: function () {
			return !this.phoneNumber;
		},
		validate: {
			validator: function (v) {
				return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
			},
			message: 'Please provide a valid email address.',
		},
	},
	phoneNumber: {
		type: String,
		unique: false,
		required: function () {
			return !this.email;
		},
		validate: {
			validator: function (v) {
				return /^\+?\d{1,3}[- ]?\d{3}[- ]?\d{4}$/.test(v);
			},
			message: 'Please provide a valid phone number.',
		},
	},
	password: {
		type: String,
		required: true,
		minlength: 4,
		maxlength: 100,
	},
	activated: {
		type: Boolean,
		default: false,
	},
	verificationCode: String,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	customerId: String,
	jwttoken: String,
	refreshtoken: String,
	tokenDateEnd: Date,
	roles: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Role',
		},
	],
});

UserSchema.methods.generateAuthToken = function () {
	const User = this;
	const secret = process.env.JWT_SECRET;
	const token = jwt.sign({ _id: User._id }, secret, {
		expiresIn: '2m',
	},);
	User.token = token;
	return token;
}

UserSchema.methods.generateRefreshToken = function () {
	const User = this;
	const secret = process.env.REFRESH_TOKEN_SECRET;
	const refreshToken = jwt.sign({ _id: User._id }, secret, {
		expiresIn: '5m',
	},);
	User.refreshToken = refreshToken;
	return refreshToken;
}

UserSchema.pre('save', async function (next) {
	const User = this;
	if (User.isModified('password')) {
		User.password = await bcryptjs.hash(User.password, 12);
	}
	next();
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
