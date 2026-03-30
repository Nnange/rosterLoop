package com.rosterloop.rosterloop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@rosterloop.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInvitationEmail(String toEmail, String householdName, String inviterName, String invitationLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("You've been invited to join " + householdName + " on RosterLoop");
            message.setText(buildInvitationEmailBody(householdName, inviterName, invitationLink));

            mailSender.send(message);
        } catch (Exception e) {
            // Log the error but don't throw - invitation is already created
            logger.warn("Failed to send invitation email: " + e.getMessage(), e);
        }
    }

    public void sendVerificationEmail(String toEmail, String verificationLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verify your email address for RosterLoop");
            message.setText(buildVerificationEmailBody(verificationLink));

            mailSender.send(message);
        } catch (Exception e) {
            // Log the error but don't throw - user is already created
            logger.warn("Failed to send verification email: " + e.getMessage(), e);
        }
    }

    private String buildInvitationEmailBody(String householdName, String inviterName, String invitationLink) {
        return "Hello,\n\n" +
               inviterName + " has invited you to join the household '" + householdName + "' on RosterLoop.\n\n" +
               "RosterLoop helps you manage and coordinate cleaning schedules with your roommates.\n\n" +
               "To accept this invitation, please visit:\n" +
               invitationLink + "\n\n" +
               "This invitation will expire in 30 days.\n\n" +
               "If you didn't expect this invitation, you can simply ignore this email.\n\n" +
               "Best regards,\n" +
               "The RosterLoop Team";
    }

    private String buildVerificationEmailBody(String verificationLink) {
        return "Hello,\n\n" +
               "Thank you for registering with RosterLoop! Please verify your email address by clicking the link below:\n\n" +
               verificationLink + "\n\n" +
               "This verification link will expire in 24 hours.\n\n" +
               "If you didn't create this account, you can safely ignore this email.\n\n" +
               "Best regards,\n" +
               "The RosterLoop Team";
    }
}
