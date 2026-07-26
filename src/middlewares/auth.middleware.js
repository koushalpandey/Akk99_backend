import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import client from '../config/googleConfig.js';

const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please login first.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired. Please login again.'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. Please login again.'
        });
      }
      throw error;
    }

    // Check if session exists and is valid - FIXED VERSION
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        userId: decoded.id,
        isRevoked: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true  // Remove the where clause from here
      }
    });

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid. Please login again.'
      });
    }

    // Check if user is active
    if (!session.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact admin.'
      });
    }

    // Attach user and session to request
    req.user = session.user;
    req.session = session;
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
};

// this middleware is for verifying the google OAuth token
export const verifyOAuthToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()
    return {
      sucess: true,
      email: payload?.email,
      name: payload?.name,
      picture: payload?.picture,
      email_verified: payload?.email_verified,
      GoogleId: payload?.sub,
    }

  } catch (error) {
    console.log("error form token middleware", error.message);
    return {
      sucess: false,
      message: error.message
    }

  }
}