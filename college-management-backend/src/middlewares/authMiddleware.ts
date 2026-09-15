
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../modules/auth/user.model'; 

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // get token from header
            token = req.headers.authorization.split(' ')[1];

            // decrypt token
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

        
            const currentUser = await User.findById(decoded.id).select('-password');
            
            if (!currentUser) {
                return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
            }

            
            (req as any).user = {
                id: currentUser._id,
                role: currentUser.role,
                name: currentUser.name,
                email: currentUser.email
            };

            return next();
        } catch (error) {
            console.error('JWT Verification Token Error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// check role gateway
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): any => {
        const user = (req as any).user;
        
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ 
                message: `Role (${user?.role || 'Guest'}) is not allowed to access this resource` 
            });
        }
        next();
    };
};
