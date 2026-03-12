import nodemailer from "nodemailer";

if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
  console.error("❌ Variáveis de email não carregadas", {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  });
}

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    family: 4,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Erro SMTP:", error);
  } else {
    console.log("✅ SMTP conectado com sucesso");
  }
});

export async function sendResetPasswordEmail(email, code) {
  await transporter.sendMail({
    from: `"Sokacheski Corp" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Código de recuperação de senha",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Recuperação de Senha</h2>
        <p>Use o código abaixo para redefinir sua senha:</p>
        <h1 style="letter-spacing: 4px;">${code}</h1>
        <p>Este código expira em 10 minutos.</p>
      </div>
    `,
  });
}
