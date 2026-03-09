const {validateToken}=require("../services/authentication")

function checkForAuthenticationCookie(cookieName){
    return (req,res,next)=>{
        let tokenCookieValue = req.cookies[cookieName];
        
        // Support for React frontend sending Bearer token
        if (!tokenCookieValue && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            tokenCookieValue = req.headers.authorization.split(' ')[1];
        }

        if (!tokenCookieValue) {
            return next();
        }

        try {
            // Sometimes localstorage adds quotes around the token strings, strip them
            const cleanToken = tokenCookieValue.replace(/^"|"$/g, '').trim();
            const userPayload = validateToken(cleanToken);
            req.user = userPayload;
        } catch (error) {
            console.error("Token verification failed:", error.message);
        }
       return next();

    }
}

module.exports={
    checkForAuthenticationCookie,
}