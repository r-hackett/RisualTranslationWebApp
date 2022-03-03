using Microsoft.AspNetCore.Http;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using MySqlConnector;

namespace UserAuth.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private const string AdminPassword = "admin";

        IUserAuthDatabase db = new MySQLUserAuthDatabase("127.0.0.1", "userauth", "root", "");

        private readonly ILogger<AuthenticationController> _logger;

        public AuthenticationController(ILogger<AuthenticationController> logger)
        {
            _logger = logger;
        }

        // HTTP GET
        [HttpGet("Validate")]
        public AuthenticationResult Validate(string username, string password)
        {
            return db.Validate(username, password);
        }

        // HTTP POST
        [HttpGet("AddUser")]
        public AuthenticationResult AddUser(string username, string password, string adminPassword)
        {
            if (adminPassword == AdminPassword)
                return db.AddUser(username, password);
            else
                return new AuthenticationResult(false, "Wrong admin password. Access denied");
        }

        // HTTP DELETE
        [HttpGet("DeleteUser")]
        public AuthenticationResult DeleteUser(string username, string adminPassword)
        {
            if (adminPassword == AdminPassword)
                return db.DeleteUser(username);
            else
                return new AuthenticationResult(false, "Wrong admin password. Access denied");
        }

        // HTTP PUT
        [HttpGet("ChangePassword")]
        public AuthenticationResult ChangePassword(string username, string password, string adminPassword)
        {
            if (adminPassword == AdminPassword)
                return db.ChangePassword(username, password);
            else
                return new AuthenticationResult(false, "Wrong admin password. Access denied");
        }
    }
}
