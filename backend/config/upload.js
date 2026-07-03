const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileType = require('file-type');

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.doc', '.docx'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const uploadsDir = path.join(__dirname, '..', 'uploads');
const privateDir = path.join(uploadsDir, 'private');

for (const dir of [uploadsDir, privateDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const makeStorage = (destination) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, destination),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Format de fichier non autorisé (PDF, images, DOC acceptés)'), false);
  }
  cb(null, true);
};

const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(ext)) {
    return cb(new Error('Format de fichier non autorisé (images uniquement)'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: makeStorage(uploadsDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const privateUpload = multer({
  storage: makeStorage(privateDir),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const avatarUpload = multer({
  storage: makeStorage(uploadsDir),
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const demandeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === 'photo_profil' ? uploadsDir : privateDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, name);
  },
});

const demandeUpload = multer({
  storage: demandeStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const verifyMime = async (filePath, allowedMimes = ALLOWED_MIMES) => {
  try {
    const type = await FileType.fromFile(filePath);
    if (type && allowedMimes.includes(type.mime)) return true;
  } catch {
    // fallback sur l'extension si la détection échoue
  }
  const ext = path.extname(filePath).toLowerCase();
  const extMimeMap = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  const mime = extMimeMap[ext];
  return mime ? allowedMimes.includes(mime) : false;
};

const verifyImageMime = (filePath) => verifyMime(filePath, IMAGE_MIMES);

const toPrivatePath = (filename) => `private/${filename}`;

const resolveUploadPath = (storedPath) => {
  if (!storedPath) return null;
  if (storedPath.startsWith('private/')) {
    return path.join(uploadsDir, storedPath);
  }
  const basename = path.basename(storedPath);
  const rootPath = path.join(uploadsDir, basename);
  if (fs.existsSync(rootPath)) return rootPath;
  const privatePath = path.join(privateDir, basename);
  if (fs.existsSync(privatePath)) return privatePath;
  return path.join(uploadsDir, storedPath);
};

upload.verifyMime = verifyMime;
upload.verifyImageMime = verifyImageMime;
upload.privateUpload = privateUpload;
upload.avatarUpload = avatarUpload;
upload.demandeUpload = demandeUpload;
upload.toPrivatePath = toPrivatePath;
upload.resolveUploadPath = resolveUploadPath;
upload.privateDir = privateDir;
upload.uploadsDir = uploadsDir;

module.exports = upload;
