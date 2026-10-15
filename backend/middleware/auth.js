const jwt = require('jsonwebtoken');

const publicRoutes = ['/api/v1/auth/login', '/api/v1/auth/logout', '/health', '/api/v1'];

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET wajib diisi (minimal 32 karakter) di production');
  }

  return 'dev_only_secret_change_me_min_32_chars';
}

const authMiddleware = (req, res, next) => {
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

  try {
    const payload = jwt.verify(authHeader.slice(7), getJwtSecret());
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau kedaluwarsa',
    });
  }
};

authMiddleware.getJwtSecret = getJwtSecret;

module.exports = authMiddleware;
