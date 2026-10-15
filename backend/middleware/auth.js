const authMiddleware = (req, res, next) => {
  const publicRoutes = ['/api/v1/auth/login', '/api/v1/auth/logout', '/health', '/api/v1'];

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan atau format salah',
    });
  }

  const token = authHeader.slice(7);

  if (!token || token.length < 20) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid',
    });
  }

  req.user = { token };
  next();
};

module.exports = authMiddleware;
