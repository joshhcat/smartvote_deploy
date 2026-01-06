import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private transporter;

  constructor(private configService: ConfigService) {
    // Create a transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  // Send email function
  async sendEmail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: '"No Reply" <noreply@gmail.com>', // sender address
        to, // recipient address
        subject, // Subject line
        text, // plain text body
        html, // html body
      });

      console.log('Email sent:', info.messageId);
    } catch (err) {
      console.error('Error sending email:', err);
    }
  }
}
