namespace Server.Services.EmailService
{
  using Server.DataTransferObjects;
  using MailKit.Net.Smtp;
  using MailKit.Security;
  using MimeKit;
  using MimeKit.Text;
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            this._configuration = configuration;
        }
        public async Task<bool> SendEmail(EmailDTO request)
        {
            try
            {
                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(_configuration["EmailService:EmailSender"]));
                email.To.Add(MailboxAddress.Parse(request.To));
                email.Subject = request.Subject;
                email.Body = new TextPart(TextFormat.Html) { Text = request.Body };

                using var smtp = new SmtpClient();
                
                await smtp.ConnectAsync(_configuration["EmailService:EmailHost"], 587, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_configuration["EmailService:EmailUsername"], _configuration["EmailService:EmailPassword"]);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                
                Console.WriteLine($"SENT MAIL TO {request.To}");
                
                return true;
            }
            catch (Exception ex)
            {
                // Handle and log the exception appropriately
                Console.WriteLine($"An error occurred while sending email: {ex.Message}");
                // You might want to throw the exception again to propagate it further if needed

                return false;
            }
        }
    }
}
