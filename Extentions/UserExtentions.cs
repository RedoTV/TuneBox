using System.Text.RegularExpressions;
using TuneBox.Models;

namespace TuneBox.Extentions;

public static class UserExtentions
{
    public static bool ValidateEmail(this User user)
    {
        Regex regex = new Regex(@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");
        return regex.IsMatch(user.Email);
    }
}
