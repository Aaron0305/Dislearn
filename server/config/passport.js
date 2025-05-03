    import passport from 'passport';
    import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
    import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
    import User from '../models/User.js';

    // Opciones para JWT
    const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'mi_secreto_muy_seguro'
    };

    // Configuración de Passport
    export default () => {
    // Estrategia JWT
    passport.use(
        new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id);
            if (user) {
            return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
        })
    );

    // Estrategia de Google OAuth
    passport.use(
        new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
            // Buscar usuario existente con el Google ID
            let user = await User.findOne({ googleId: profile.id });

            // Si no existe, verificar si el email ya está registrado
            if (!user && profile.emails && profile.emails.length > 0) {
                user = await User.findOne({ email: profile.emails[0].value });
                
                // Si existe un usuario con ese email, vincular el Google ID
                if (user) {
                user.googleId = profile.id;
                await user.save();
                } else {
                // Crear un nuevo usuario
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    nombre: profile.displayName,
                    // No incluimos contraseña para usuarios de Google
                });
                }
            }
            return done(null, user);
            } catch (error) {
            return done(error, false);
            }
        }
        )
    );

    // Serialización y deserialización para sesiones
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
    };
