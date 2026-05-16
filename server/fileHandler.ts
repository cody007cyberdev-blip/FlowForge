/**
 * File Handler - Upload and download files for workflow automation
 */

import { Router } from "express";
import type { Request, Response } from "express";
import * as db from "./db";
import { storagePut, storageGet } from "./storage";
import multer from "multer";


const router = Router();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

/**
 * Upload file for workflow
 */
router.post("/upload", upload.single("file"), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { workflowId } = req.body;
    if (!workflowId) {
      return res.status(400).json({ error: "workflowId is required" });
    }

    // Store file in S3
    const fileKey = `workflows/${workflowId}/${Date.now()}-${req.file.originalname}`;
    const { key, url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);

    // Record in database (workspaceId would come from auth context in real app)
    const fileRecord = await db.createFile({
      workspaceId: 1, // TODO: Get from auth context
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      storageKey: key,
      url: url,
    });

    res.json({
      success: true,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url,
        key,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

/**
 * Download file
 */
router.get("/download/:fileId", async (req: any, res: Response) => {
  try {
    const { fileId } = req.params;

    // Get file record from database (simplified - in production, query by file ID)
    // const file = await db.getFileById(parseInt(fileId));
    const file = null; // TODO: Implement getFileById in db.ts

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Get presigned URL from storage
    const { url } = await storageGet((file as any).storageKey);

    res.json({
      success: true,
      file: {
        name: (file as any).fileName,
        size: (file as any).fileSize,
        mimeType: (file as any).mimeType,
        url,
        uploadedAt: (file as any).createdAt,
      },
    });
  } catch (error) {
    console.error("File download error:", error);
    res.status(500).json({ error: "File download failed" });
  }
});

/**
 * List files for workflow
 */
router.get("/workflow/:workflowId", async (req: any, res: Response) => {
  try {
    const { workflowId } = req.params;

    // TODO: Implement getFilesByWorkflowId in db.ts
    const files: any[] = [];

    res.json({
      success: true,
      files: files.map((f: any) => ({
        id: f.id,
        name: f.fileName,
        size: f.fileSize,
        mimeType: f.mimeType,
        uploadedAt: f.createdAt,
      })) || [],
    });
  } catch (error) {
    console.error("File list error:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

export default router;
