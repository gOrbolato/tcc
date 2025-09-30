const bcrypt = require('bcrypt');
const saltRounds = 10; // O mesmo valor usado no seu código
const plainPassword = 'sua-senha-aqui'; // Substitua pela senha desejada

bcrypt.hash(plainPassword, saltRounds, function(err, hash) {
  if (err) {
    console.error('Erro ao gerar o hash:', err);
  } else {
    console.log('Seu hash é:', hash);
  }
});