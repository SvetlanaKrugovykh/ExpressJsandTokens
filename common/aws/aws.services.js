const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

class AwsService {
	constructor(convertService) {
		this.AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
		this.s3 = new S3Client({
			region: 'eu-central-1',
			credentials: {
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			},
		});
		this.convertService = convertService;
	}

	async uploadAvatar(buffer, key) {
		const params = {
			Bucket: this.AWS_S3_BUCKET,
			Key: key,
			Body: buffer,
			ContentType: "image/jpeg",
		};
		const command = new PutObjectCommand(params);
		const upload = await this.s3.send(command);
		return upload;
	}
}

module.exports = AwsService;