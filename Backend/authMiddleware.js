// authMiddleware.js
module.exports = (req, res, next) => {
  // Vérifier si l'utilisateur existe dans la session
  if (!req.session || !req.session.user) {
    return res.status(401).json({ 
      message: 'Not authenticated',
      authenticated: false 
    });
  }
  
  // L'utilisateur est authentifié, continuer
  next();
};