import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Contoh: dukuhretreat@gmail.com
        pass: process.env.EMAIL_PASS, // App Password Gmail 16 digit
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"The Dukuh Retreat" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error("Email Error:", error);
        return { success: false, error };
    }
};