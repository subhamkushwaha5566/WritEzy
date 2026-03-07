const {validateToken}=require("../services/authentication")

function checkForAuthenticationCookie(cookieName){
    return (req,res,next)=>{
        let tokenCookieValue = req.cookies[cookieName];
        
        // Support for React frontend sending Bearer token
        if (!tokenCookieValue && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            tokenCookieValue = req.headers.authorization.split(' ')[1];
        }

        if(!tokenCookieValue){
            return next();
        }


        try {
            const userPayload=validateToken(tokenCookieValue);
            req.user=userPayload;
        } catch (error) {}
       return next();

    }
}

module.exports={
    checkForAuthenticationCookie,
}