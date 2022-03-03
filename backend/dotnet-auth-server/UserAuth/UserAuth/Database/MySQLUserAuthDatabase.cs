using MySqlConnector;

namespace UserAuth
{
    public class MySQLUserAuthDatabase : IUserAuthDatabase
    {
        private string connectionString;

        public MySQLUserAuthDatabase(string server, string database, string user, string password)
        {
            connectionString = "Server=" + server + ";Database=" + database + ";Uid=" + user + ";Pwd=" + password;
        }

        private bool UserExists(string username)
        {
            MySqlConnectionStringBuilder builder = new MySqlConnectionStringBuilder();
            builder.ConnectionString = connectionString;

            using MySqlConnection connection = new MySqlConnection(builder.ConnectionString);

            string sql = "SELECT username FROM user WHERE username = ?usernameVal;";
            using MySqlCommand command = new MySqlCommand(sql, connection);
            
            connection.Open();
            command.Parameters.AddWithValue("?usernameVal", username);
            MySqlDataReader reader = command.ExecuteReader();
            reader.Read();
            if (reader.HasRows)
                return true;

            return false;
        }

        public AuthenticationResult Validate(string username, string password)
        {
            if (username == null || password == null)
                return new AuthenticationResult(false, "Username and password must not be empty");

            try
            {
                MySqlConnectionStringBuilder builder = new MySqlConnectionStringBuilder();
                builder.ConnectionString = connectionString;

                using MySqlConnection connection = new MySqlConnection(builder.ConnectionString);

                string sql = "SELECT password FROM user WHERE username = ?usernameVal;";
                using MySqlCommand command = new MySqlCommand(sql, connection);

                connection.Open();
                command.Parameters.AddWithValue("?usernameVal", username);

                using MySqlDataReader reader = command.ExecuteReader();
                if (!reader.HasRows)
                    return new AuthenticationResult(false, "User does not exist");

                reader.Read();
                if (password != reader.GetString(0))
                    return new AuthenticationResult(false, "Incorrect password");
            }
            catch (MySqlException e)
            {
                return new AuthenticationResult(false, e.ToString());
            }

            return new AuthenticationResult(true, "Username and password are valid");
        }

        public AuthenticationResult AddUser(string username, string password)
        {
            if (username == null || password == null)
                return new AuthenticationResult(false, "Username and password must not be empty");

            try
                {
                MySqlConnectionStringBuilder builder = new MySqlConnectionStringBuilder();
                builder.ConnectionString = connectionString;

                if (UserExists(username))
                    return new AuthenticationResult(false, "Username already exists");

                using MySqlConnection connection = new MySqlConnection(builder.ConnectionString);

                string sql = "INSERT INTO user (username, password) VALUES (?usernameVal, ?passwordVal);";

                using MySqlCommand command = new MySqlCommand(sql, connection);
                connection.Open();
                command.Parameters.AddWithValue("?usernameVal", username);
                command.Parameters.AddWithValue("?passwordVal", password);
                command.ExecuteNonQuery();
            }
            catch (MySqlException e)
            {
                return new AuthenticationResult(false, e.ToString());
            }

            return new AuthenticationResult(true, "User added successfully");
        }

        public AuthenticationResult ChangePassword(string username, string password)
        {
            if (username == null || password == null)
                return new AuthenticationResult(false, "Username and password must not be empty");

            try
            {
                MySqlConnectionStringBuilder builder = new MySqlConnectionStringBuilder();
                builder.ConnectionString = connectionString;

                if (!UserExists(username))
                    return new AuthenticationResult(false, "Username does not exist");

                using MySqlConnection connection = new MySqlConnection(builder.ConnectionString);

                string sql = "UPDATE user SET password = ?passwordVal WHERE username = ?usernameVal;";

                using MySqlCommand command = new MySqlCommand(sql, connection);
                connection.Open();
                command.Parameters.AddWithValue("?passwordVal", password);
                command.Parameters.AddWithValue("?usernameVal", username);
                command.ExecuteNonQuery();
            }
            catch (MySqlException e)
            {
                return new AuthenticationResult(false, e.ToString());
            }

            return new AuthenticationResult(true, "Password changed successfully");
        }

        public AuthenticationResult DeleteUser(string username)
        {
            if (username == null)
                return new AuthenticationResult(false, "Username is null");

            try
            {
                MySqlConnectionStringBuilder builder = new MySqlConnectionStringBuilder();
                builder.ConnectionString = connectionString;

                if (!UserExists(username))
                    return new AuthenticationResult(false, "Username does not exist");

                using MySqlConnection connection = new MySqlConnection(builder.ConnectionString);

                string sql = "DELETE FROM user WHERE username = ?usernameVal;";

                using MySqlCommand command = new MySqlCommand(sql, connection);
                connection.Open();
                command.Parameters.AddWithValue("?usernameVal", username);
                command.ExecuteNonQuery();
            }
            catch (MySqlException e)
            {
                return new AuthenticationResult(false, e.ToString());
            }

            return new AuthenticationResult(true, "User deleted successfully");
        }
    }
}