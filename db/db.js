const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('./models/user');
const Token = require('./models/token');
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true });
mongoose.connection.on('error', (err) => {
	console.error(`MongoDB connection error: ${err}`);
	process.exit(1);
});

// Create a User
async function createUser(username, email, password) {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	const user = await User.create({ username, email, password: hashedPassword });
	return user;
}

// Verify Email
async function verifyEmail(userId, emailToken) {
	const user = await User.findById(userId);
	if (!user) {
		throw new Error('User not found');
	}
	if (user.emailToken !== emailToken) {
		throw new Error('Invalid email token');
	}
	user.emailVerified = true;
	user.emailToken = null;
	await user.save();
}

// Send Email Verification
async function sendEmailVerification(user) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
	});
	const mailOptions = {
		from: 'myapp@example.com',
		to: user.email,
		subject: 'Verify Your Email Address',
		html: `<p>Dear ${user.username},</p>
               <p>Thank you for creating an account on My App. Please click the following link to verify your email address:</p>
               <a href="${process.env.BASE_URL}/verify-email/${user.id}/${user.emailToken}">Verify Email</a>
               <p>If you did not create an account on My App, please ignore this email.</p>`,
	};
	await transporter.sendMail(mailOptions);
}

// Save Refresh Token
async function saveRefreshToken(token) {
	await Token.create({ token });
}

module.exports = { createUser, verifyEmail, sendEmailVerification, saveRefreshToken };
