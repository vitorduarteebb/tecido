import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }
  // URL pública para acessar a imagem
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

export default router; 