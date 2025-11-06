"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => {
    // Verifica se o objeto user existe e se a propriedade isAdmin é verdadeira
    if (req.user && req.user.isAdmin) {
        // Se for admin, permite que a requisição continue
        next();
    }
    else {
        // Se não for admin, retorna um erro de "Acesso Proibido"
        return res.status(403).json({ message: 'Acesso negado: Requer privilégios de administrador.' });
    }
};
exports.isAdmin = isAdmin;
