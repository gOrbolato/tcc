import React from 'react';
import '../assets/styles/Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Plataforma de Avaliação Educacional</h3>
        <p>&copy; {new Date().getFullYear()} Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;