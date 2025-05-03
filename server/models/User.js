import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() {
            // La contraseña es requerida solo si no hay googleId
            return !this.googleId;
        }
    },
    nombre: {
        type: String,
        required: true
    },
    googleId: {
        type: String
    },
    direccion: {
        estado: String,
        municipio: String,
        colonia: String,
        calle: String,
        numero: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook para hashear la contraseña
userSchema.pre('save', async function(next) {
    // Solo hashear la contraseña si ha sido modificada o es nueva
    if (!this.isModified('password') || !this.password) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

export default User;