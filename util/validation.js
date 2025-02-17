postIsValid = (title, content) => {
    return (
        title &&
        content&&
        title.trim() !== '' &&
        content.trim() !== ''
    );
};

userCredentialsAreValid = (email, confirmEmail, password) => {
        return (
            email &&
            confirmEmail &&
            password && 
            password.length > 6 && 
            email === confirmEmail &&
            email.includes('@')
        );
    };

module.exports = {
    postIsValid: postIsValid,
    userCredentialsAreValid: userCredentialsAreValid
}