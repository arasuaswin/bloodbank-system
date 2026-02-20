import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"

const ses = new SESClient({ region: process.env.AWS_REGION || "ap-south-1" })

export async function sendEmail(to: string, subject: string, body: string) {
    // In dev, we might not have AWS creds. Log instead if it fails.
    if (process.env.NODE_ENV === 'development' && !process.env.AWS_ACCESS_KEY_ID) {
        console.log(`[Mock Email] To: ${to}, Subject: ${subject}, Body: ${body}`)
        return
    }

    const command = new SendEmailCommand({
        Source: process.env.NOTIFICATION_EMAIL || "admin@bloodbank.com", // Must be verified in SES
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Data: subject,
            },
            Body: {
                Html: {
                    Data: body,
                },
            },
        },
    })

    try {
        await ses.send(command)
        console.log(`Email sent to ${to}`)
    } catch (error) {
        console.error("Failed to send email:", error)
        // Don't crash the request if email fails
    }
}
