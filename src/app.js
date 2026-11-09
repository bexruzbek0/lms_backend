import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import config from './config/index.js';
import router from './routers/index.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ limits: { fileSize: 200 * 1024 * 1024 }, abortOnLimit: true }));

// Yuklangan fayllar: http://localhost:3000/uploads/banner/...
app.use('/uploads', express.static(config.uploadsDir));

app.get('/', (req, res) => res.json({ status: 200, message: 'iTLive LMS backend ishlayapti' }));
app.use('/api', router);

app.use(notFound);
app.use(errorHandler);

export default app;
