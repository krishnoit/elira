import nodemailer from 'nodemailer'

let cachedTransporter = null
function getTransporter() {
  if (cachedTransporter) return cachedTransporter
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return cachedTransporter
}

export async function sendMail({ to, subject, html }) {
  const transporter = getTransporter()
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  return transporter.sendMail({ from, to, subject, html })
}

export function passwordResetEmail({ name, link, isAdmin = false }) {
  const label = isAdmin ? 'Admin Portal' : 'Elira Atelier'
  return {
    subject: `${label} — Reset your password`,
    html: `<!DOCTYPE html><html><body style="margin:0;font-family:Georgia,serif;background:#faf7f2;padding:40px 20px">
      <div style="max-width:560px;margin:auto;background:#ffffff;border:1px solid #e6dfd0">
        <div style="background:#1a1a1a;color:#faf7f2;padding:30px;text-align:center">
          <div style="font-size:36px;font-weight:300;letter-spacing:4px">ELIRA</div>
          <div style="font-size:11px;letter-spacing:3px;color:#b8935a;margin-top:4px">ATELIER${isAdmin ? ' · ADMIN' : ''}</div>
        </div>
        <div style="padding:40px 30px;color:#1a1a1a">
          <div style="font-size:11px;letter-spacing:3px;color:#b8935a;margin-bottom:8px">— PASSWORD RESET</div>
          <h1 style="font-weight:300;font-size:32px;margin:0 0 16px 0">Hello${name ? ', ' + name : ''}.</h1>
          <p style="color:#555;line-height:1.6;font-size:15px">We received a request to reset your password. Click the button below to set a new one. This link is valid for the next <strong>60 minutes</strong>.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${link}" style="display:inline-block;background:#1a1a1a;color:#faf7f2;text-decoration:none;padding:16px 40px;letter-spacing:3px;font-size:12px">RESET PASSWORD</a>
          </div>
          <p style="color:#888;font-size:13px;line-height:1.6">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color:#b8935a;font-size:12px;word-break:break-all">${link}</p>
          <p style="color:#888;font-size:13px;margin-top:24px">If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>
        </div>
        <div style="background:#f0ebe1;padding:20px;text-align:center;color:#888;font-size:11px;letter-spacing:2px">© 2026 ELIRA ATELIER · ALL RIGHTS RESERVED</div>
      </div>
    </body></html>`,
  }
}

export function orderConfirmationEmail({ name, order }) {
  const rows = order.items.map(i => {
    const unit = Math.round(i.price * (1 - (i.discount||0)/100))
    return `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.name} <span style="color:#888;font-size:12px">(${i.size} · ${i.color} × ${i.qty})</span></td><td style="padding:8px;text-align:right;border-bottom:1px solid #eee">₹${(unit*i.qty).toLocaleString('en-IN')}</td></tr>`
  }).join('')
  return {
    subject: `Elira Atelier — Order Confirmation #${order.orderNumber}`,
    html: `<!DOCTYPE html><html><body style="margin:0;font-family:Georgia,serif;background:#faf7f2;padding:40px 20px">
      <div style="max-width:560px;margin:auto;background:#ffffff;border:1px solid #e6dfd0">
        <div style="background:#1a1a1a;color:#faf7f2;padding:30px;text-align:center">
          <div style="font-size:36px;font-weight:300;letter-spacing:4px">ELIRA</div>
          <div style="font-size:11px;letter-spacing:3px;color:#b8935a;margin-top:4px">ATELIER</div>
        </div>
        <div style="padding:40px 30px;color:#1a1a1a">
          <div style="font-size:11px;letter-spacing:3px;color:#b8935a;margin-bottom:8px">— ORDER CONFIRMED</div>
          <h1 style="font-weight:300;font-size:32px;margin:0 0 8px 0">Thank you, ${name || 'friend'}.</h1>
          <p style="color:#555;line-height:1.6">Your order <strong>#${order.orderNumber}</strong> has been received. Our atelier will begin preparing your pieces with the utmost care.</p>
          <table style="width:100%;border-collapse:collapse;margin:24px 0">${rows}</table>
          <div style="text-align:right;font-size:20px;font-weight:300;padding-top:12px;border-top:2px solid #b8935a">TOTAL: <span style="color:#b8935a">₹${order.totals.total.toLocaleString('en-IN')}</span></div>
        </div>
      </div>
    </body></html>`,
  }
}
