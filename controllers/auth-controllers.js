const User = require('../models/user');
const validationSession = require('../util/validation-session');
const validation = require('../util/validation');

get401 = (req, res) => {
    res.status('401').render('401');
    return;
}


getSignUp = (req, res) => {
    const sessionErrorData = validationSession.getSessionErrorData(req, {
        email: '',
        confirmEmail: '',
        password: ''
    })

    res.render('signup', {
        inputData: sessionErrorData,
    });
};

getLogin = (req, res) => {
    const sessionErrorData = validationSession.getSessionErrorData(req, {
        email: '',
        password: ''
    })

    res.render('login', {
        inputData: sessionErrorData,
    });
};

signup = async (req, res) => {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredConfirmEmail = userData['confirm-email'];
    const enteredPassword = userData.password;

    if (! validation.userCredentialsAreValid(enteredEmail, enteredConfirmEmail, enteredPassword)
    ) {
        validationSession.flashErrorsToSession(req, {
            message: 'Invalid input - please check your data.',
            email: enteredEmail,
            confirmEmail: enteredConfirmEmail,
            password: enteredPassword
        }, () => {
            res.redirect('/signup')
        }
    );
    
        return;
    }

    const newUser = new User(enteredEmail, enteredPassword);
    const userExistsAlready = await newUser.existsAlready();

    if(userExistsAlready) {
        validationSession.flashErrorsToSession(req, {
            message: 'User already axists!',
            email: enteredEmail,
            confirmEmail: enteredConfirmEmail,
            password: enteredPassword
        }, () => {
            res.redirect('/signup');
        })
        
        return;
    };

    await newUser.signup();

    res.redirect('/login');
};

login = async (req, res) => {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredPassword = userData.password;

    const newUser = new User(enteredEmail, enteredPassword);
    const existingUser = await newUser.getUserWithSameEmail();

    if(!existingUser) {
        validationSession.flashErrorsToSession(req, {
            message: 'Could not log in - please check you credentials!',
            email: enteredEmail,
            password: enteredPassword
        }, () => {
            res.redirect('/login');
        }
    );
        return;
    };

    const success = await newUser.login(existingUser.password);

    if(!success) {
        req.session.inputData = {
            hasError: true,
            message: 'Could not log in - please check you credentials!',
            email: enteredEmail,
            password: enteredPassword
        };

        req.session.save(() => {
            res.redirect('/login');
        });
        return;
    }

    req.session.user = {
        id: existingUser._id,
        email: existingUser.email
    };
    req.session.isAuthenticated = true;

    req.session.save(() => {
        res.redirect('/admin');
    });

};

logout = (req, res)=>{
    req.session.user = null;
    req.session.isAuthenticated = false;
    res.redirect('/');
};



module.exports = {
    getSignUp : getSignUp,
    getLogin : getLogin,
    signup: signup,
    login: login,
    logout: logout,
    get401: get401
}