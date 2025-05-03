// auth.js (ruta del controlador de autenticación)
import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Ajusta la ruta según tu estructura
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Variables de entorno (deberías configurarlas en un archivo .env)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

// Configurar Passport con Google Strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/google/callback",
    scope: ['profile', 'email']
},
async (accessToken, refreshToken, profile, done) => {
    try {
    // Buscar si el usuario ya existe en la base de datos
    let user = await User.findOne({ email: profile.emails[0].value });
    
    if (!user) {
        // Si no existe, crear un nuevo usuario
        user = new User({
        email: profile.emails[0].value,
        nombre: profile.displayName,
        googleId: profile.id,
        // Puedes agregar más campos según lo que necesites
        });
        await user.save();
    } else if (!user.googleId) {
        // Si el usuario existe pero no tiene googleId (se registró con email/password)
        user.googleId = profile.id;
        await user.save();
    }
    
    return done(null, user);
    } catch (error) {
    return done(error, null);
    }
}
));

// Serializar y deserializar usuario para mantener la sesión
passport.serializeUser((user, done) => {
done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
try {
    const user = await User.findById(id);
    done(null, user);
} catch (error) {
    done(error, null);
}
});

// Ruta para iniciar el flujo de autenticación con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback URL después de la autenticación con Google
router.get('/google/callback', 
passport.authenticate('google', { session: false, failureRedirect: '/login' }),
(req, res) => {
    // Generar token JWT
    const token = jwt.sign(
    { 
        id: req.user._id,
        email: req.user.email,
        nombre: req.user.nombre
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
    );
    
    // Redirigir al frontend con el token
    res.redirect(`${CLIENT_URL}/auth-success?token=${token}`);
}
);

export default router;