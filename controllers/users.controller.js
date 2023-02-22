const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendVerificationEmail } = require('../common/sendouter');


exports.newUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		const verificationCode = Math.floor(
			Math.random() * Math.floor(999999),
		).toString();

		if (user) {
			return res.status(400).send({
				message: 'User already exists',
			});
		}

		const newUser = new User({
			email,
			password,
			verificationCode,
		});
		await newUser.save();

		await sendVerificationEmail(email, verificationCode);

		res.status(201).send({
			data: {
				email: newUser.email,
				activated: newUser.activated,
				createdAt: newUser.createdAt,
			},
		});
	} catch (error) {
		res.status(500).send({
			status: 500,
			error: error.message,
		});
	}
}

exports.activateUser = async (req, res) => {
	try {
		const { email, password, verificationCode } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).send({ message: 'User not found' });
		}

		if (user.activated) { return res.status(400).send({ message: 'User already activated' }); }

		const passwordEquals = await bcrypt.compare(password, user.password);
		if (!passwordEquals) {
			return res.status(400).send({ message: 'Incorrect password' });
		}

		if (
			new Date().getTime() - user.createdAt >
			Number(process.env.VERIFICATION_CODE_TIME)
		) { return res.status(400).send({ message: 'Verification code expired' }); }

		if (user.verificationCode !== verificationCode) {
			return res.status(400).send({ message: 'Incorrect verification code' });
		}

		user.activated = true;
		user.save();

		res.status(201).send({
			data: {
				email: user.email,
				activated: user.activated,
				createdAt: user.createdAt,
			},
		});



	} catch (error) {
		res.status(500).send({
			status: 500,
			error: error.message,
		});
	}
}

exports.getUser = async (req, res) => {
	try {
		const id = req.params._id;

		const user = await User.findById({ _id: id });

		if (!user) {
			return res.status(404).send({
				message: 'User not found',
			});
		}

		res.status(200).send({
			data: user,
		});
	} catch (error) {
		res.status(500).send({
			error,
		});
	}
}

exports.getUsers = async (req, res) => {
	try {
		const users = await User.find({});

		if (!users) {
			return res.status(404).send({
				message: 'No users found',
			});
		}

		res.status(200).send({
			data: users,
		});
	} catch (error) {
		res.status(500).send({
			error,
		});
	}
}

exports.updateUser = async (req, res) => {
	try {
		const id = req.params._id;

		const updates = Object.keys(req.body);

		const user = await User.findById({ _id: id }).exec();

		if (!user) {
			return res.status(404).send({
				message: 'User not found',
			});
		}

		updates.forEach((update) => {
			user[update] = req.body[update];
		}
		);

		await user.save();

		res.status(200).send({
			data: user,
		});
	} catch (error) {
		res.status(500).send({
			error,
		});
	}

}

exports.deleteUser = async (req, res) => {
	try {
		const id = req.params._id;

		const user = await User.findById({ _id: id }).exec();

		if (!user) {
			return res.status(404).send({
				message: 'User not found',
			});
		}

		await user.remove();

		res.status(200).send({
			message: 'User deleted',
		});
	} catch (error) {
		res.status(500).send({
			error,
		});
	}
}

exports.loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (!user || !user.activated) {
			return res.status(401).send({
				message: 'User not found',
			});
		}

		const isMatch = await bcryptjs.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({
				message: 'Incorrect Password, Try again!',
			});
		}

		const authToken = await user.generateAuthToken();
		const refreshToken = await user.generateRefreshToken();

		res.status(200).send({
			data: {
				email: user.email,
				message: "login successful",
				authToken: authToken,
				refreshToken: refreshToken,   //temprorary
			},
		});
	} catch (error) {
		res.status(500).send({
			error,
		});
	}
}

exports.refreshTokenUser = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).send({
				message: 'No refresh token provided',
			});
		}

		await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const user = await User.findOne(refreshToken._id).exec();

		if (!user) {
			return res.status(401).send({
				message: 'User not found',
			});
		}

		const authToken = await user.generateAuthToken();

		res.status(200).send({
			data: {
				authToken: authToken,
				message: 'Refresh token successful',
			},
		});
	} catch (error) {
		console.log(error);
		res.status(500).send({
			error,
		});
	}
}

exports.logoutUser = async (req, res) => {
	try {

		const id = req.params._id;
		const user = await User.findOne({ _id: id }).exec();

		if (!user) {
			return res.status(401).send({
				message: 'User not found',
			});
		}

		user.token = '';

		user.refreshToken = '';

		await user.save();

		res.status(200).send({
			message: 'Logout successful',
		});
	} catch (error) {
		res.status(500).send({
			error,
		});
	}
}

