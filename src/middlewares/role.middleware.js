export const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
      try {
        const userRole = req.user?.role;
  
        if (!userRole) {
          return res.status(401).json({
            success: false,
            error: 'User role not found'
          });
        }
  
        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({
            success: false,
            error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
          });
        }
  
        next();
      } catch (error) {
        console.error('Role middleware error:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal server error during authorization'
        });
      }
    };
  };
  
  // Check if user is admin
  export const isAdmin = (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          error: 'User role not found'
        });
      }
      
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required. You do not have permission to access this resource.'
        });
      }
      
      next();
    } catch (error) {
      console.error('isAdmin middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during authorization'
      });
    }
  };
  
  // Check if user is regular user
  export const isUser = (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          error: 'User role not found'
        });
      }
      
      if (userRole !== 'user') {
        return res.status(403).json({
          success: false,
          error: 'User access required'
        });
      }
      
      next();
    } catch (error) {
      console.error('isUser middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during authorization'
      });
    }
  };
  
  // Check if user has specific role
  export const hasRole = (role) => {
    return (req, res, next) => {
      try {
        const userRole = req.user?.role;
        
        if (!userRole) {
          return res.status(401).json({
            success: false,
            error: 'User role not found'
          });
        }
        
        if (userRole !== role) {
          return res.status(403).json({
            success: false,
            error: `Role "${role}" required. You have "${userRole}" role.`
          });
        }
        
        next();
      } catch (error) {
        console.error('hasRole middleware error:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal server error during authorization'
        });
      }
    };
  };
  
  // Check if user has any of the allowed roles
  export const hasAnyRole = (allowedRoles) => {
    return (req, res, next) => {
      try {
        const userRole = req.user?.role;
        
        if (!userRole) {
          return res.status(401).json({
            success: false,
            error: 'User role not found'
          });
        }
        
        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({
            success: false,
            error: `Access denied. Allowed roles: ${allowedRoles.join(', ')}`
          });
        }
        
        next();
      } catch (error) {
        console.error('hasAnyRole middleware error:', error);
        return res.status(500).json({
          success: false,
          error: 'Internal server error during authorization'
        });
      }
    };
  };