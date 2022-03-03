using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace UserAuth
{
    public class AuthenticationResult
    {
        public AuthenticationResult()
        {
        }

        public AuthenticationResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }

        public bool Success { get; set; }

        public string Message { get; set; }
    }
}