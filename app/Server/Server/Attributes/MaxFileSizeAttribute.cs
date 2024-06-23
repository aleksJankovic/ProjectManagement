using System.ComponentModel.DataAnnotations;

namespace Server.Attributes;

public class MaxFileSizeAttribute : ValidationAttribute
{
    private readonly int _maxFileSize;

    public MaxFileSizeAttribute(int maxFileSize)
    {
        _maxFileSize = maxFileSize;
    }

    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        if (value is IFormFile file)
        {
            if (file.Length > _maxFileSize)
            {
                return new ValidationResult($"The file size is too big! Must be below < {_maxFileSize / 1024}KB");
            }
        }

        return ValidationResult.Success;
    }
}