const http = require('http');
const nodemailer = require('nodemailer');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zainali5002@gmail.com',
        pass: 'ejuncfogwiswiotb',
    },
});

const sendEmail = (options) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/') {
        // Serve the HTML form
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    } else if (req.method === 'POST' && pathname === '/submit-form') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const { name, email, message } = JSON.parse(body);

            const mailOptionsUser = {
                from: 'info@motibex.com',
                to: email,
                subject: 'We’ve Received Your Message!',
                text: `Hi ${name},\n\nWe’ve received your contact form submission and appreciate you reaching out to us.\n\nOne of our team members will get back to you shortly to assist with your inquiry. If you need immediate assistance, please feel free to email us at support@[yourcompany].com.\n\nWe look forward to helping you!\n\nBest regards,\nThe MotieTax Team`,
            };

            const mailOptionsCompany = {
                from: 'info@motibex.com',
                to: 'techhedge360@gmail.com',
                subject: 'New Contact Form Submission Received',
                text: `Hi Team,\n\nA new contact form submission has been received from our website. Here are the details:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}\n\nPlease follow up with the customer at your earliest convenience. If you need any assistance, feel free to reach out.\n\nBest regards,\nThe Website Notification System`,
            };

            try {
                await sendEmail(mailOptionsUser);
                console.log('Email sent to user');
                await sendEmail(mailOptionsCompany);
                console.log('Email sent to company');
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Form submitted successfully');
            } catch (error) {
                console.error('Error sending email:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error sending email');
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
