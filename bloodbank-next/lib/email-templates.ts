
export const EmailTemplates = {
    otp: (code: string) => `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #e11d48;">BloodBank Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${code}</h1>
            <p>This code will expire in 10 minutes.</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
    `,

    appointmentApproved: (donorName: string, date: string, time: string) => `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #16a34a;">Appointment Approved!</h2>
            <p>Hello ${donorName},</p>
            <p>Your donation appointment has been confirmed.</p>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Location:</strong> Main Blood Bank Center</p>
            </div>
            <p>Thank you for saving lives!</p>
        </div>
    `,

    appointmentRejected: (donorName: string, date: string) => `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #e11d48;">Appointment Update</h2>
            <p>Hello ${donorName},</p>
            <p>Unfortunately, we cannot proceed with your appointment on ${date} at this time.</p>
            <p>Please contact us or try booking for a different slot.</p>
        </div>
    `
}
