gaurdRoute = (req, res, next) => {
    const isAuth = req.session.isAuthenticated;

    if(!res.locals.isAuth) {
        return res.redirect('/401');
    };

  next();
}


module.exports = gaurdRoute;