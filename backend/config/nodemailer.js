import nodemailer from 'nodemailer';
import shared from 'nodemailer/lib/shared/index.js';

// Force Nodemailer to strictly use IPv4 and never pick unreachable IPv6 addresses
if (shared && shared.networkInterfaces) {
    const orig = shared.networkInterfaces;
    const ipv4Only = {};
    for (const [k, v] of Object.entries(orig)) {
        ipv4Only[k] = v.filter(i => i.family === 'IPv4' || i.family === 4);
    }
    shared.networkInterfaces = ipv4Only;
}

let transporter = null;

export const getTransporter = () => {
    if (!transporter) {
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (user && pass) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: Number(process.env.SMTP_PORT) || 465,
                secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
                auth: { user, pass },
                pool: true,
                maxConnections: 5,
                maxMessages: Infinity,
                family: 4 // Force IPv4
            });
        }
    }
    return transporter;
};

/**
 * Sends an email safely with IPv4-only enforcement and automatic retry.
 * Never throws — always returns { success, messageId? , simulated?, error? }.
 */
export const sendMailSafe = async ({ to, subject, html, text, headers = {} }, retries = 2) => {
    try {
        const mailer = getTransporter();
        const sender = process.env.SENDER_EMAIL || process.env.SMTP_USER || 'Therapique <support@therapique.com>';

        if (!mailer) {
            console.log('\n📧 [Email — Dev Mode (no SMTP configured)]');
            console.log(`   To: ${to}`);
            console.log(`   Subject: ${subject}`);
            console.log('   → Set SMTP_USER and SMTP_PASS in backend/.env to send real emails.\n');
            return { success: true, simulated: true };
        }

        // Unique entity reference ID to prevent Gmail from merging distinct transactional messages into conversation threads
        const uniqueRefId = `<${Date.now()}.${Math.random().toString(36).substring(2, 10)}@therapique.com>`;

        const mailOptions = {
            from: sender,
            to,
            subject,
            text: text || '',
            html,
            headers: {
                'X-Entity-Ref-ID': uniqueRefId,
                ...headers
            }
        };

        const info = await mailer.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to} (ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        if (retries > 0) {
            console.warn(`⚠️ Email to ${to} attempt failed (${error.message}). Retrying...`);
            await new Promise(r => setTimeout(r, 800));
            return sendMailSafe({ to, subject, html, text, headers }, retries - 1);
        }
        console.error(`❌ Email to ${to} failed:`, error.message);
        return { success: false, error: error.message };
    }
};

export default getTransporter;
