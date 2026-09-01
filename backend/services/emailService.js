import { sendMailSafe } from '../config/nodemailer.js';

// ─────────────────────────────────────────────────
// Shared HTML wrapper — Therapique beige/brown style with Anti-Quoting Engine
// ─────────────────────────────────────────────────
const wrap = ({ title, preheader = '', body }) => {
    // Generate distinct entropy tokens to guarantee Gmail's quote trimmer never folds the message
    const nonce = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#F7F3EE;color:#2D2825;margin:0;padding:0;line-height:1.6}
.c{max-width:600px;margin:20px auto;background:#FFF;border-radius:20px;overflow:hidden;border:1px solid #EADBCE;box-shadow:0 4px 20px rgba(70,56,48,.05)}
.hd{background:#FAF5EE;padding:28px 24px;text-align:center;border-bottom:1px solid #EADBCE}
.logo{font-size:26px;font-weight:800;color:#1A1715;margin:0}
.tag{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#8C7B70;margin-top:4px;font-weight:600}
.bd{padding:32px 28px}
.card{background:#FAF5EE;border:1px solid #EADBCE;border-radius:16px;padding:20px;margin:20px 0}
.badge{display:inline-block;padding:4px 12px;border-radius:50px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.bg{background:#E6F4EA;color:#137333}
.bp{background:#F3E8FF;color:#7E22CE}
.ba{background:#FEF3C7;color:#92400E}
.br{background:#FEE2E2;color:#991B1B}
.btn{display:inline-block;background:#1A1715;color:#FFF!important;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:700;font-size:13px;margin:20px 0 10px;letter-spacing:.5px}
.ft{background:#FAF5EE;padding:20px;text-align:center;font-size:12px;color:#8C7B70;border-top:1px solid #EADBCE}
</style>
</head>
<body>
<!-- Preheader + hidden unique entropy to prevent Gmail quote trimming -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:0;line-height:0;color:transparent;">
  ${preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;[Ref: ${nonce}]
</div>
<div class="c">
  <div class="hd">
    <h1 class="logo">therapique</h1>
    <div class="tag">Clinical Psychological Care & Bookstore</div>
  </div>
  <div class="bd">
    ${body}
  </div>
  <div class="ft">
    <p style="margin:0 0 6px">Therapique Mental Health & Wellness</p>
    <p style="margin:0;font-size:11px;color:#A6978C">This is an automated notification &bull; Ref: #${nonce}</p>
  </div>
</div>
<!-- Anti-trimming invisible unique token to prevent Gmail from collapsing thread content -->
<div style="display:none;white-space:nowrap;font:15px courier;color:#F7F3EE;font-size:0;line-height:0;height:0;overflow:hidden;mso-hide:all;">
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;[${nonce}-${timestamp}]
</div>
</body>
</html>`;
};

const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formats dates cleanly as "01-09-2026 (1 Sep 2026)" with explicit hyphens and gap
const fmtDate = (d) => {
    if (!d) return 'TBD';
    const parts = String(d).split('_');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const monthNum = parseInt(parts[1], 10);
        const monthPad = parts[1].padStart(2, '0');
        const monthStr = monthNames[monthNum] || monthPad;
        const year = parts[2];
        return `${day}-${monthPad}-${year} (${parseInt(day, 10)} ${monthStr} ${year})`;
    }
    return String(d).replace(/_/g, '-');
};

// Robust HTML Table Row — bulletproof on mobile Gmail / Outlook with generous gap & separate alignment
const tableRow = (label, val, valStyle = '') => `
  <tr>
    <td align="left" style="padding:10px 0;border-bottom:1px dashed #E5D5C6;color:#73645A;font-size:13px;font-weight:600;vertical-align:top;width:38%">${label}</td>
    <td align="right" style="padding:10px 0;border-bottom:1px dashed #E5D5C6;color:#1A1715;font-size:13px;font-weight:700;text-align:right;vertical-align:top;width:62%;${valStyle}">${val}</td>
  </tr>`;

const tableWrap = (rowsHtml) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:4px 0">
  ${rowsHtml}
</table>`;

// ─────────────────────────────────────────────────
// 1. Appointment Booking Confirmation → Patient
// ─────────────────────────────────────────────────
export const sendAppointmentBookingEmail = async ({
    appointmentId,
    patientEmail, patientName, doctorName, doctorSpeciality,
    slotDate, slotTime, amount, isPaid = true, paymentMethod = 'Online'
}) => {
    if (!patientEmail) return;
    const d = fmtDate(slotDate);
    const shortRef = appointmentId ? String(appointmentId).slice(-6).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    return sendMailSafe({
        to: patientEmail,
        subject: `Appointment Confirmed with Dr. ${doctorName} — ${d} [#${shortRef}]`,
        html: wrap({
            title: 'Consultation Confirmed — Therapique',
            preheader: `Session with Dr. ${doctorName} on ${d} at ${slotTime}. Ref #${shortRef}`,
            body: `
<h2 style="font-size:20px;font-weight:800;color:#1A1715;margin-top:0">Consultation Confirmed ✨</h2>
<p style="color:#4A423D;font-size:14px">Hello <b>${patientName || 'Patient'}</b>, your session with <b>Dr. ${doctorName}</b> is confirmed.</p>
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span style="font-weight:800;font-size:15px;color:#1A1715">Session Details</span>
    <span class="badge bg">Confirmed</span>
  </div>
  ${tableWrap(`
    ${tableRow('Booking Ref', `#${shortRef}`)}
    ${tableRow('Therapist', `Dr. ${doctorName}`)}
    ${tableRow('Speciality', doctorSpeciality || 'Clinical Therapy')}
    ${tableRow('Date & Time', `${d} at ${slotTime}`)}
    ${tableRow('Fee', `₹${amount || 0} (${paymentMethod})`)}
    ${tableRow('Status', isPaid ? 'Payment Received' : 'Pending', isPaid ? 'color:#15803D;' : 'color:#B45309;')}
  `)}
</div>
<p style="font-size:13px;color:#665950">💡 Please be ready 5 minutes before your slot. You can access your session anytime from <b>My Appointments</b>.</p>`
        })
    });
};

// ─────────────────────────────────────────────────
// 2. New Appointment Alert → Doctor
// ─────────────────────────────────────────────────
export const sendDoctorNewAppointmentAlert = async ({
    appointmentId,
    doctorEmail, doctorName, patientName, slotDate, slotTime
}) => {
    if (!doctorEmail) return;
    const d = fmtDate(slotDate);
    const shortRef = appointmentId ? String(appointmentId).slice(-6).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    return sendMailSafe({
        to: doctorEmail,
        subject: `New Appointment: ${patientName} (${d} @ ${slotTime}) [#${shortRef}]`,
        html: wrap({
            title: 'New Patient Booked — Therapique',
            preheader: `${patientName} booked a session on ${d} at ${slotTime}. Ref #${shortRef}`,
            body: `
<h2 style="font-size:20px;font-weight:800;color:#1A1715;margin-top:0">New Session Booked 📅</h2>
<p style="color:#4A423D;font-size:14px">Hello <b>Dr. ${doctorName}</b>, a new consultation has been scheduled with you.</p>
<div class="card">
  ${tableWrap(`
    ${tableRow('Booking Ref', `#${shortRef}`)}
    ${tableRow('Patient', patientName || 'Patient')}
    ${tableRow('Date', d)}
    ${tableRow('Time', slotTime)}
  `)}
</div>`
        })
    });
};

// ─────────────────────────────────────────────────
// 3. Appointment Cancellation (Patient + Doctor + Therapique Official)
// ─────────────────────────────────────────────────
export const notifyAppointmentCancellation = async ({
    appointmentId,
    patientEmail,
    patientName,
    doctorEmail,
    doctorName,
    slotDate,
    slotTime,
    cancelledBy = 'user', // 'user' | 'doctor' | 'admin'
    refundMessage = '',
    needsRefundChoice = false,
    amount = 0
}) => {
    const d = fmtDate(slotDate);
    const shortRef = appointmentId ? String(appointmentId).slice(-6).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const officialEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'therapique.official@gmail.com';

    // Clear role-specific labelling
    let cancellerLabel = 'Patient';
    if (cancelledBy === 'admin') {
        cancellerLabel = 'Therapique Administration (Admin)';
    } else if (cancelledBy === 'doctor') {
        cancellerLabel = `Dr. ${doctorName || 'Doctor'}`;
    } else {
        cancellerLabel = `Patient (${patientName || 'User'})`;
    }

    const promises = [];

    // ─────────────────────────────────────────────
    // 1. Email to Patient
    // ─────────────────────────────────────────────
    if (patientEmail) {
        let patientSubject = `Appointment Cancelled with Dr. ${doctorName || 'Doctor'} (${d} @ ${slotTime}) [#${shortRef}]`;
        let patientIntro = `Hello <b>${patientName || 'Patient'}</b>, you have cancelled your consultation with <b>Dr. ${doctorName || 'Doctor'}</b> scheduled for <b>${d} at ${slotTime}</b>.`;

        if (cancelledBy === 'admin') {
            patientSubject = `Appointment Cancelled by Administration: Dr. ${doctorName || 'Doctor'} (${d} @ ${slotTime}) [#${shortRef}]`;
            patientIntro = `Hello <b>${patientName || 'Patient'}</b>, your consultation with <b>Dr. ${doctorName || 'Doctor'}</b> scheduled for <b>${d} at ${slotTime}</b> was cancelled by <b>Therapique Administration</b>.`;
        } else if (cancelledBy === 'doctor') {
            patientSubject = `Appointment Cancelled by Dr. ${doctorName || 'Doctor'} (${d} @ ${slotTime}) [#${shortRef}]`;
            patientIntro = `Hello <b>${patientName || 'Patient'}</b>, <b>Dr. ${doctorName || 'Doctor'}</b> has cancelled the consultation scheduled for <b>${d} at ${slotTime}</b>.`;
        }

        let refundChoiceHtml = '';
        if (needsRefundChoice && amount > 0) {
            refundChoiceHtml = `
<div class="card" style="border: 2px solid #7C3AED; background: #FAF5FF; margin-top: 16px;">
  <span style="font-weight:800;font-size:14px;color:#6B21A8;display:block;margin-bottom:8px">⚡ Choose Your Refund Method (₹${amount})</span>
  <p style="margin:0 0 10px;font-size:13px;color:#4A423D;line-height:1.5">
    Because you paid <b>₹${amount}</b> online via Razorpay, you can choose how you would like to receive your money back:
  </p>
  <div style="background:#ffffff;border-radius:12px;padding:12px;margin-bottom:12px;border:1px solid #E9D5FF">
    <p style="margin:0 0 8px;font-size:13px;color:#1E293B"><b>⚡ Instant Therapique Tokens:</b> Credited 1:1 into your wallet immediately for zero-delay rebooking with any doctor.</p>
    <p style="margin:0;font-size:13px;color:#1E293B"><b>🏦 Direct Bank / UPI Refund:</b> Sent directly back to your original payment account via Razorpay (3-5 business days).</p>
  </div>
  <p style="margin:0 0 14px;font-size:12px;color:#6B21A8;font-weight:600">
    👉 When you open the Therapique website, a popup will ask how you'd like your refund. Or click below:
  </p>
  <div style="text-align:center">
    <a href="${frontendUrl}/my-appointments" style="display:inline-block;background:#7C3AED;color:#ffffff!important;font-weight:800;font-size:13px;padding:12px 24px;border-radius:50px;text-decoration:none;box-shadow:0 4px 12px rgba(124,58,237,.25)">
      Choose Refund on Website →
    </a>
  </div>
</div>`;
        }

        promises.push(
            sendMailSafe({
                to: patientEmail,
                subject: patientSubject,
                html: wrap({
                    title: 'Appointment Cancelled — Therapique',
                    preheader: `Your session with Dr. ${doctorName || 'Doctor'} on ${d} has been cancelled. Ref #${shortRef}`,
                    body: `
<h2 style="font-size:20px;font-weight:800;color:#B91C1C;margin-top:0">Appointment Cancelled</h2>
<p style="color:#4A423D;font-size:14px">${patientIntro}</p>
<div class="card" style="background:#FEF2F2;border-color:#FCA5A5">
  ${tableWrap(`
    ${tableRow('Booking Ref', `#${shortRef}`)}
    ${tableRow('Doctor', `Dr. ${doctorName || 'Doctor'}`)}
    ${tableRow('Date & Time', `${d} at ${slotTime}`)}
    ${tableRow('Cancelled By', cancellerLabel, 'color:#B91C1C;font-weight:bold;')}
  `)}
</div>
${refundChoiceHtml}
${refundMessage && !needsRefundChoice ? `<div class="card" style="border-left:4px solid #10B981;background:#ECFDF5"><span style="font-weight:800;font-size:13px;color:#065F46;text-transform:uppercase;display:block;margin-bottom:4px">Refund Details</span><p style="margin:0;font-size:14px;color:#1E293B;font-weight:600">${refundMessage}</p></div>` : ''}
<p style="font-size:13px;color:#665950;margin-top:16px">You can book another session anytime from the Doctors directory.</p>`
                })
            })
        );
    }

    // ─────────────────────────────────────────────
    // 2. Email to Doctor
    // ─────────────────────────────────────────────
    if (doctorEmail) {
        let doctorSubject = `[Notice] Appointment Cancelled: ${patientName || 'Patient'} (${d} @ ${slotTime}) [#${shortRef}]`;
        let doctorIntro = `Hello <b>Dr. ${doctorName || 'Doctor'}</b>, patient <b>${patientName || 'Patient'}</b> has cancelled their consultation scheduled for <b>${d} at ${slotTime}</b>.`;

        if (cancelledBy === 'admin') {
            doctorSubject = `[Admin Notice] Appointment Cancelled by Administration: ${patientName || 'Patient'} (${d} @ ${slotTime}) [#${shortRef}]`;
            doctorIntro = `Hello <b>Dr. ${doctorName || 'Doctor'}</b>, <b>Therapique Administration</b> has cancelled the upcoming consultation with patient <b>${patientName || 'Patient'}</b> scheduled for <b>${d} at ${slotTime}</b>.`;
        } else if (cancelledBy === 'doctor') {
            doctorSubject = `Appointment Cancellation Confirmed: ${patientName || 'Patient'} (${d} @ ${slotTime}) [#${shortRef}]`;
            doctorIntro = `Hello <b>Dr. ${doctorName || 'Doctor'}</b>, you have cancelled the consultation with patient <b>${patientName || 'Patient'}</b> scheduled for <b>${d} at ${slotTime}</b>.`;
        }

        promises.push(
            sendMailSafe({
                to: doctorEmail,
                subject: doctorSubject,
                html: wrap({
                    title: 'Appointment Cancelled — Therapique',
                    preheader: `Session with ${patientName || 'Patient'} on ${d} at ${slotTime} was cancelled by ${cancellerLabel}. Ref #${shortRef}`,
                    body: `
<h2 style="font-size:20px;font-weight:800;color:#B91C1C;margin-top:0">Appointment Cancelled 📅</h2>
<p style="color:#4A423D;font-size:14px">${doctorIntro}</p>
<div class="card" style="background:#FEF2F2;border-color:#FCA5A5">
  ${tableWrap(`
    ${tableRow('Booking Ref', `#${shortRef}`)}
    ${tableRow('Patient', patientName || 'Patient')}
    ${tableRow('Date & Time', `${d} at ${slotTime}`)}
    ${tableRow('Cancelled By', cancellerLabel, 'color:#B91C1C;font-weight:bold;')}
    ${tableRow('Time Slot', 'Released (Available for new bookings)', 'color:#15803D;font-weight:bold;')}
  `)}
</div>
<p style="font-size:13px;color:#665950">This slot has been opened on your calendar for other patients to book.</p>`
                })
            })
        );
    }

    // ─────────────────────────────────────────────
    // 3. Email to Therapique Official / Admin
    // ─────────────────────────────────────────────
    if (officialEmail) {
        let alertSubject = `[Cancellation Alert] ${patientName || 'Patient'} with Dr. ${doctorName || 'Doctor'} (${d}) [#${shortRef}]`;
        if (cancelledBy === 'admin') {
            alertSubject = `[Admin Action] Cancelled Appointment: ${patientName || 'Patient'} with Dr. ${doctorName || 'Doctor'} (${d}) [#${shortRef}]`;
        } else if (cancelledBy === 'doctor') {
            alertSubject = `[Doctor Action] Cancelled Appointment: ${patientName || 'Patient'} by Dr. ${doctorName || 'Doctor'} (${d}) [#${shortRef}]`;
        } else {
            alertSubject = `[Patient Action] Cancelled Appointment by ${patientName || 'Patient'}: Dr. ${doctorName || 'Doctor'} (${d}) [#${shortRef}]`;
        }

        promises.push(
            sendMailSafe({
                to: officialEmail,
                subject: alertSubject,
                html: wrap({
                    title: 'Appointment Cancellation Alert — Therapique',
                    preheader: `Appointment cancelled by ${cancellerLabel} for ${d} @ ${slotTime}. Ref #${shortRef}`,
                    body: `
<h2 style="font-size:20px;font-weight:800;color:#B91C1C;margin-top:0">Platform Cancellation Alert ⚠️</h2>
<p style="color:#4A423D;font-size:14px">An appointment was cancelled on the Therapique platform.</p>
<div class="card">
  ${tableWrap(`
    ${tableRow('Booking Ref', `#${shortRef}`)}
    ${tableRow('Patient', `${patientName || 'Patient'} (${patientEmail || 'No email'})`)}
    ${tableRow('Doctor', `Dr. ${doctorName || 'Doctor'} (${doctorEmail || 'No email'})`)}
    ${tableRow('Date & Time', `${d} at ${slotTime}`)}
    ${tableRow('Cancelled By', cancellerLabel, 'color:#B91C1C;font-weight:bold;')}
    ${needsRefundChoice ? tableRow('Refund Status', `Pending Patient Choice on Website (₹${amount})`, 'color:#7C3AED;font-weight:bold;') : ''}
    ${refundMessage ? tableRow('Refund Details', refundMessage, 'color:#059669;font-weight:bold;') : ''}
  `)}
</div>`
                })
            })
        );
    }

    return Promise.all(promises);
};

// Backwards-compatible alias for existing code
export const sendAppointmentCancellationEmail = notifyAppointmentCancellation;

// ─────────────────────────────────────────────────
// 4. Refund Execution Confirmation → Patient
// ─────────────────────────────────────────────────
export const sendRefundConfirmedEmail = async ({
    appointmentId,
    patientEmail,
    patientName,
    doctorName,
    amount = 0,
    refundMethod = 'tokens'
}) => {
    if (!patientEmail) return;
    const shortRef = appointmentId ? String(appointmentId).slice(-6).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase();
    const isTokens = refundMethod === 'tokens';
    const methodDesc = isTokens
        ? `${amount} Therapique Tokens credited instantly to your wallet.`
        : `₹${amount} refund initiated directly to your original Bank / UPI account via Razorpay (3-5 business days).`;

    return sendMailSafe({
        to: patientEmail,
        subject: `Refund Confirmed: ₹${amount} — Dr. ${doctorName || 'Doctor'} [#${shortRef}]`,
        html: wrap({
            title: 'Refund Confirmed — Therapique',
            preheader: `Your ₹${amount} refund has been processed as ${isTokens ? 'Tokens' : 'Bank Refund'}. Ref #${shortRef}`,
            body: `
<h2 style="font-size:20px;font-weight:800;color:#059669;margin-top:0">Refund Confirmed ✅</h2>
<p style="color:#4A423D;font-size:14px">Hello <b>${patientName || 'Patient'}</b>, your refund choice has been successfully executed for the cancelled session with Dr. ${doctorName || 'Doctor'}.</p>
<div class="card" style="background:#ECFDF5;border-color:#A7F3D0">
  ${tableWrap(`
    ${tableRow('Refund Ref', `#${shortRef}`)}
    ${tableRow('Doctor', `Dr. ${doctorName || 'Doctor'}`)}
    ${tableRow('Refund Amount', `₹${amount}`, 'font-weight:bold;color:#047857;')}
    ${tableRow('Method', isTokens ? '⚡ Therapique Tokens (Instant)' : '🏦 Bank / UPI (Razorpay)')}
    ${tableRow('Status', methodDesc, 'color:#059669;font-weight:bold;')}
  `)}
</div>
<p style="font-size:13px;color:#665950">Thank you for choosing Therapique. We look forward to supporting your mental wellness journey.</p>`
        })
    });
};

// ─────────────────────────────────────────────────
// 5. Book Order Confirmation (Customer + Therapique Official)
// ─────────────────────────────────────────────────
export const sendBookOrderPlacedEmail = async ({
    userEmail, userName, orderId, items = [], amount = 0, paymentMethod = 'COD', address = {}
}) => {
    const officialEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'therapique.official@gmail.com';
    const shortId = orderId ? String(orderId).slice(-8) : Math.random().toString(36).substring(2, 8).toUpperCase();
    const recipientName = `${address.firstName || ''} ${address.lastName || ''}`.trim() || userName || 'Customer';
    const recipientPhone = address.phone || '';
    const recipientEmail = userEmail || address.email;
    const isTokens = String(paymentMethod).toLowerCase().includes('token');
    const amountDisplay = isTokens ? `${amount} Tokens` : `₹${amount.toLocaleString('en-IN')}`;

    const itemsRows = items.map(i => tableRow(
        `${i.name || i.title || 'Book'}<br><span style="font-size:11px;color:#8C7B70">${i.format || 'Standard'} × ${i.quantity || 1}</span>`,
        isTokens ? `${(i.price || 0) * (i.quantity || 1)} Tokens` : `₹${((i.price || 0) * (i.quantity || 1)).toLocaleString('en-IN')}`
    )).join('');

    const addrParts = [
        address.street || address.line1,
        address.city || address.line2,
        address.state,
        address.zipcode ? `PIN: ${address.zipcode}` : '',
        address.country
    ].filter(Boolean);
    const addr = addrParts.join(', ');

    const promises = [];

    // 1. Email to Customer / User
    if (recipientEmail) {
        promises.push(
            sendMailSafe({
                to: recipientEmail,
                subject: `Order Confirmed #${shortId} — Therapique Bookstore`,
                html: wrap({
                    title: 'Order Confirmed — Therapique',
                    preheader: `Order #${shortId} placed. Total: ${amountDisplay}`,
                    body: `
<h2 style="font-size:20px;font-weight:800;color:#1A1715;margin-top:0">Order Placed 📦</h2>
<p style="color:#4A423D;font-size:14px">Thank you <b>${recipientName}</b>! Your bookstore order has been placed and is being prepared.</p>
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span style="font-weight:800;font-size:14px;color:#1A1715">Order #${shortId}</span>
    <span class="badge bp">${paymentMethod}</span>
  </div>
  ${tableWrap(`
    ${itemsRows}
    ${tableRow('Total', amountDisplay, 'font-size:16px;color:#1A1715;font-weight:900;')}
  `)}
</div>
${addr ? `
<div style="background:#FAF8F6;padding:12px 16px;border-radius:10px;border:1px solid #EADBCE;margin-top:12px">
  <p style="font-size:13px;color:#554A42;margin:0">🚚 <b>Shipping To:</b><br>${recipientName}<br>${addr}${recipientPhone ? `<br>📞 ${recipientPhone}` : ''}</p>
</div>` : ''}
<p style="font-size:13px;color:#665950;margin-top:14px">You can track your order anytime from <b>My Orders</b> on the Therapique website.</p>`
                })
            })
        );
    }

    // 2. Email to Therapique Official / Admin
    if (officialEmail) {
        const isPaid = isTokens || paymentMethod.toLowerCase().includes('razorpay');
        const paymentBadge = isPaid ? '<span class="badge bg">Paid & Confirmed</span>' : '<span class="badge ba">Cash on Delivery</span>';

        promises.push(
            sendMailSafe({
                to: officialEmail,
                subject: `[New Order Alert] Order #${shortId} placed by ${recipientName} (${amountDisplay})`,
                html: wrap({
                    title: 'New Bookstore Order — Therapique',
                    preheader: `New order #${shortId} from ${recipientName}. Total: ${amountDisplay}`,
                    body: `
<h2 style="font-size:20px;font-weight:800;color:#15803D;margin-top:0">New Book Order Received 📚📦</h2>
<p style="color:#4A423D;font-size:14px">A new bookstore order has been placed on <b>Therapique</b> and requires fulfillment.</p>
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <span style="font-weight:800;font-size:14px;color:#1A1715">Order #${shortId}</span>
    ${paymentBadge}
  </div>
  ${tableWrap(`
    ${tableRow('Customer', `${recipientName} (${recipientEmail || 'No email'})`)}
    ${recipientPhone ? tableRow('Phone', recipientPhone) : ''}
    ${tableRow('Order ID', `#${shortId}`)}
    ${tableRow('Payment Method', paymentMethod)}
    ${tableRow('Payment Status', isPaid ? 'Payment Received' : 'Cash on Delivery (Pending)', isPaid ? 'color:#15803D;' : 'color:#B45309;')}
    ${itemsRows}
    ${tableRow('Total Amount', amountDisplay, 'font-size:16px;color:#1A1715;font-weight:900;')}
  `)}
</div>
${addr ? `
<div style="background:#F8FAFC;padding:12px 16px;border-radius:10px;border:1px solid #E2E8F0;margin-top:12px">
  <p style="font-size:13px;color:#334155;margin:0">🚚 <b>Shipping Destination:</b><br>${recipientName}<br>${addr}${recipientPhone ? `<br>📞 ${recipientPhone}` : ''}</p>
</div>` : ''}
<p style="font-size:13px;color:#73645A;margin-top:14px">You can view and update this order in the <b>Therapique Admin Panel</b> under Book Orders.</p>`
                })
            })
        );
    }

    return Promise.all(promises);
};

// ─────────────────────────────────────────────────
// 6. Order Status Update → Customer
// ─────────────────────────────────────────────────
export const sendOrderStatusUpdateEmail = async ({
    userEmail, userName, orderId, status = 'Order Placed'
}) => {
    if (!userEmail) return;
    const shortId = orderId ? String(orderId).slice(-8) : Math.random().toString(36).substring(2, 8).toUpperCase();
    const updateNonce = Math.random().toString(36).substring(2, 6).toUpperCase();
    return sendMailSafe({
        to: userEmail,
        subject: `Order ${status}! (#${shortId}) [#${updateNonce}]`,
        html: wrap({
            title: `Order ${status} — Therapique`,
            preheader: `Your order #${shortId} is now "${status}".`,
            body: `
<h2 style="font-size:20px;font-weight:800;color:#1A1715;margin-top:0">Order Update 🚚</h2>
<p style="color:#4A423D;font-size:14px">Hello <b>${userName || 'Customer'}</b>, your order <b>#${shortId}</b> has been updated:</p>
<div class="card" style="text-align:center;padding:24px">
  <span style="font-size:12px;font-weight:700;text-transform:uppercase;color:#73645A;display:block;margin-bottom:6px">Current Status</span>
  <span class="badge bg" style="font-size:14px;padding:6px 18px">${status}</span>
</div>`
        })
    });
};

// ─────────────────────────────────────────────────
// 7. Contact Form → Admin alert + User auto-reply
// ─────────────────────────────────────────────────
export const sendContactFormEmails = async ({ firstName, lastName, email, phone, message }) => {
    const name = `${firstName || ''} ${lastName || ''}`.trim() || 'Visitor';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@therapique.com';
    const ticketId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Alert to admin
    sendMailSafe({
        to: adminEmail,
        subject: `New Inquiry from ${name} [Ticket #${ticketId}] (Contact Form)`,
        html: wrap({
            title: 'Contact Form Submission',
            preheader: message ? message.slice(0, 80) : `Ticket #${ticketId}`,
            body: `
<h2 style="font-size:20px;font-weight:800;color:#1A1715;margin-top:0">New Message 📩</h2>
<div class="card">
  ${tableWrap(`
    ${tableRow('Ticket Ref', `#${ticketId}`)}
    ${tableRow('Name', name)}
    ${tableRow('Email', email || 'N/A')}
    ${tableRow('Phone', phone || 'N/A')}
  `)}
</div>
<div style="background:#FFF8F0;padding:16px;border-radius:12px;border:1px solid #EADBCE;margin-top:12px">
  <b>Message:</b><p style="margin:8px 0 0;color:#332B25">${message}</p>
</div>`
        })
    });

    // Auto-reply to visitor
    if (email) {
        sendMailSafe({
            to: email,
            subject: `Thank you for contacting Therapique, ${firstName || 'there'}! [Ticket #${ticketId}]`,
            html: wrap({
                title: 'Message Received — Therapique',
                preheader: `We received your inquiry. Reference #${ticketId}`,
                body: `
<h2 style="font-size:20px;font-weight:800;color:#1A1715;margin-top:0">We Received Your Message 💬</h2>
<p style="color:#4A423D;font-size:14px">Hello <b>${firstName || 'there'}</b>, thank you for reaching out. Our team will respond within 24 hours.</p>
<div class="card">
  ${tableWrap(`
    ${tableRow('Ticket Ref', `#${ticketId}`)}
    ${tableRow('Subject', 'Support / General Inquiry')}
    ${tableRow('Status', 'Received & Under Review', 'color:#15803D;font-weight:bold;')}
  `)}
</div>
<p style="font-size:13px;color:#665950">If your inquiry is urgent regarding a booked consultation, please mention your booking reference.</p>`
            })
        });
    }
};
