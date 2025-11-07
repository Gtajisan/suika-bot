module.exports = function(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/login?error=Please login to access this page');
};
