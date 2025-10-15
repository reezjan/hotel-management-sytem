import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { existsSync, mkdirSync } from 'fs';

const uploadDir = './uploads/wastage-photos';
const billDocumentDir = './uploads/bill-documents';

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

if (!existsSync(billDocumentDir)) {
  mkdirSync(billDocumentDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const randomString = nanoid(8);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${ext}`;
    cb(null, filename);
  }
});

const billDocumentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, billDocumentDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const randomString = nanoid(8);
    const ext = path.extname(file.originalname);
    const filename = `bill-${timestamp}-${randomString}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG and PNG images are allowed.'));
  }
};

const billDocumentFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG images and PDF files are allowed.'));
  }
};

export const uploadWastagePhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

export const uploadBillDocument = multer({
  storage: billDocumentStorage,
  fileFilter: billDocumentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});
