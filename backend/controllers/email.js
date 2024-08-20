async function sendEmail(req, res) {
    const { to, subject, body, file } = req.body;
    try {
        let mailOptions = {
            from: 'your-email@gmail.com',
            to,
            subject,
            text: body
        };

        if (file) {
            mailOptions.attachments = [
                {
                    filename: file.name,
                    content: file.data.toString('base64'),
                    encoding: 'base64'
                }
            ];
        }

        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
}

async function sendOtp(req, res) {
    const { to } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpMailOptions = {
        from: 'your-email@gmail.com',
        to,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    try {
        await transporter.sendMail(otpMailOptions);
        res.status(200).send({ otp });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).send('Error sending OTP');
    }
}

async function loadOtp(req, res) {
    const otpData = [
        { email: 'example@example.com', otp: '123456', date: new Date() }
    ];
    res.status(200).json(otpData);
}

module.exports = {
    sendEmail,
    sendOtp,
    loadOtp
}