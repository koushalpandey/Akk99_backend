// services/user/auth.service.js

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { log } from 'console';

const prisma = new PrismaClient();

const authService = {

  generateToken(userId, email) {
    return jwt.sign(
      { id: userId, email: email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  },


  generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  },


  async findOrCreateGoogleUser(profile) {
    try {
      const {
        GoogleId: googleId,
        email,
        name,
        picture: picture,
        email_verified: emailVerified
      } = profile;



      if (!email) {
        throw new Error('Email is required from Google profile');
      }

      if (!googleId) {
        throw new Error('Google ID is required');
      }
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { googleId: googleId }
          ]
        }
      });

      if (existingUser) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: name || existingUser.name,
            picture: picture || existingUser.picture,
            emailVerified: emailVerified || existingUser.emailVerified,
            lastLogin: new Date(),
            updatedAt: new Date()
          }
        });

        console.log('Existing user logged in:', updatedUser.email);
        return updatedUser;
      }
      const newUser = await prisma.user.create({
        data: {
          name: name || 'Google User',
          email: email,
          googleId: googleId,
          picture: picture || '',
          provider: 'google',
          emailVerified: emailVerified || false,
          isActive: true,
          lastLogin: new Date()
        }
      });

      console.log('New user created:', newUser.email);
      return newUser;

    } catch (error) {
      console.error('Error in findOrCreateGoogleUser:', error);
      throw error;
    }
  },


  async createSession(userId, token, refreshToken) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await prisma.session.create({
      data: {
        userId: userId,
        token: token,
        refreshToken: refreshToken,
        expiresAt: expiresAt
      }
    });

    return session;
  },


  async validateSession(token) {
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        expiresAt: { gt: new Date() },
        isRevoked: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            role: true,
            isActive: true
          }
        }
      }
    });
    return session;
  },


  async revokeSession(token) {
    await prisma.session.updateMany({
      where: { token: token },
      data: { isRevoked: true }
    });
  },


  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        role: true,
        isActive: true,
        emailVerified: true,
        provider: true,
        createdAt: true,
        lastLogin: true
      }
    });
    return user;
  },


  async getUserByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        picture: true,
        role: true,
        isActive: true,
        emailVerified: true,
        provider: true,
        createdAt: true,
        lastLogin: true
      }
    });
    return user;
  },


  async refreshAccessToken(refreshToken) {
    const session = await prisma.session.findFirst({
      where: {
        refreshToken: refreshToken,
        expiresAt: { gt: new Date() },
        isRevoked: false
      }
    });

    if (!session) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await this.getUserById(session.userId);
    const newToken = this.generateToken(user.id, user.email);

    await prisma.session.updateMany({
      where: { refreshToken: refreshToken },
      data: {
        token: newToken,
        updatedAt: new Date()
      }
    });

    return { token: newToken, user };
  },


  async logoutAllDevices(userId) {
    await prisma.session.updateMany({
      where: { userId: userId },
      data: { isRevoked: true }
    });
  },

  async deleteExpiredSessions() {
    await prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });
  }
};

export default authService;