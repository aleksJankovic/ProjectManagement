namespace Server.Services.EmailService
{
  using Server.DataTransferObjects;

    public interface IEmailService
    {
        Task<bool> SendEmail(EmailDTO request);
    }
}
