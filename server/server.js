// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import authRoutes from './routes/auth.js'; // Ajusta la ruta según tu estructura

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
origin: 'http://localhost:3000', // Tu frontend URL
credentials: true // Importante para las cookies de sesión
}));

// Configuración de sesión (necesaria para Passport)
app.use(session({
secret: 'TU_SECRET_DE_SESION', // Cambia esto por una cadena segura
resave: false,
saveUninitialized: false,
cookie: {
    secure: process.env.NODE_ENV === 'production', // true en producción
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
}
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/admin')
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error conectando a MongoDB:', err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Para las rutas de autenticación social

// Iniciar servidor
app.listen(PORT, () => {
console.log(`Servidor corriendo en puerto ${PORT}`);
});