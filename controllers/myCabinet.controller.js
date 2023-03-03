const sharp = require('sharp');
const awsService = require('../common/aws/aws.services');
const LiqPay = require('liqpay');
const https = require('https');

function liqpayAPI(method, data, callback) {
	const base64 = function (str) {
		return Buffer.from(str).toString('base64');
	};

	const utf8 = function (str) {
		return encodeURIComponent(str);
	};

	const str = base64(utf8(JSON.stringify(data)));
	const signature = base64(utf8(this.op.private_key + str + this.op.private_key));

	const req = https.request({
		host: 'www.liqpay.ua',
		path: '/api/' + method,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength('data=' + str + '&signature=' + signature)
		}
	}, function (res) {
		let data_ = '';
		res.on('data', function (chunk) {
			data_ += chunk;
		});
		res.on('end', function () {
			try {
				const parsedData = JSON.parse(data_);
				callback(null, parsedData);
			} catch (e) {
				callback(e);
			}
		});
	});
	req.on('error', function (e) {
		callback(e);
	});
	req.write('data=' + str + '&signature=' + signature);
	req.end();
}


exports.uploadAvatar = async (req, res) => {
	try {
		const pixels = 500;
		const key = req.headers?.key?.trim();
		const buffer = req.body;
		if ((!key) || (req.headers['content-type'] !== 'image/jpeg')) {
			throw new Error('Invalid file type');
		}
		const resizedBuffer = await sharp(buffer).resize({ width: pixels }).toBuffer();
		const aws = new awsService();
		const upload = await aws.uploadAvatar(resizedBuffer, key);
		res.status(200).send({
			status: 200,
			message: 'File uploaded successfully',
			data: upload,
		});
	} catch (error) {
		res.status(500).send({
			status: 500,
			error: error.message,
		});
	}
};

exports.payment = async (req, res) => {
	try {
		const x = req.headers?.x?.trim();
		const reqType = 'card'; // req.headers?.reqType?.trim();   // 'card' or 'qr'
		const public_key = process.env[`LIQPAY_PUBLIC_KEY_${x}`];
		const private_key = process.env[`LIQPAY_PRIVATE_KEY_${x}`];
		const liqpay = new LiqPay(public_key, private_key);
		liqpay.api = liqpayAPI;

		const {
			card_number,
			card_exp_month,
			card_exp_year,
			card_cvv,
			order_id,
			SUM,
			description,
			phoneNumber
		} = req.body;

		const dataForCard = {
			"action": "pay",
			"version": "3",
			"phone": phoneNumber,
			"amount": SUM,
			"currency": "UAH",
			"description": description,
			"order_id": order_id,
			"card": card_number,
			"card_exp_month": card_exp_month,
			"card_exp_year": card_exp_year,
			"card_cvv": card_cvv
		};

		switch (reqType) {
			case 'card':
				if (!card_number || !card_exp_month || !card_exp_year || !card_cvv || !order_id || !SUM) {
					throw new Error('Invalid card data');
				}
				liqpay.api("request", dataForCard, function (json) {
					console.log(json.status);
					res.status(200).send({
						status: 200,
						message: 'Payment successfully',
						data: json,
					});
				});
				break;
			case 'qr': {
				liqpay.api("request", {
					"action": "payqr",
					"version": "3",
					"amount": SUM,
					"currency": "UAH",
					"description": description,
					"order_id": order_id,
				}, function (json) {
					console.log(json.status);
					res.status(200).send({
						status: 200,
						message: 'File uploaded successfully',
						data: json,
					});
				});
				break;
			}
			default: {
				throw new Error('Invalid request type');
			}
		}
	} catch (error) {
		res.status(500).send({
			status: 500,
			error: error.message,
		});
	}
}


