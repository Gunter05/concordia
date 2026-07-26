import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Serveur démarré sur le port : ${PORT}`);
    console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`==================================================`);
});