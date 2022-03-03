namespace UserAuth
{
    public interface IUserAuthDatabase
    {
        public AuthenticationResult Validate(string username, string password);

        public AuthenticationResult AddUser(string username, string password);

        public AuthenticationResult DeleteUser(string username);

        public AuthenticationResult ChangePassword(string username, string password);
    }
}