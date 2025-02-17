addCSRFToken = (req, res, next) => {
    let csrfToken = req.csrfToken();
    res.locals.csrfToken = csrfToken;
    next();
}

module.exports= addCSRFToken;