import { apiClient } from './client';

export interface PDFMetadata {
  original_name: string;
  upload_date: string;
  difficulty: string;
  topics: string[];
  content_length: number;
}

export interface PDFUploadResponse {
  filename: string;
  path: string;
  difficulty: string;
  topics: string[];
}

export interface GenerateExercisesRequest {
  pdf_path?: string;
  topic?: string;
  difficulty?: string;
  count?: number;
}

export const pdfAPI = {
  // Upload a new PDF
  uploadPDF: async (file: File, difficulty?: string): Promise<PDFUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (difficulty) {
      formData.append('difficulty', difficulty);
    }
    
    const response = await apiClient.post<PDFUploadResponse>('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // List all PDFs
  listPDFs: async (): Promise<Record<string, PDFMetadata>> => {
    const response = await apiClient.get<Record<string, PDFMetadata>>('/pdf/list');
    return response.data;
  },

  // Delete a PDF
  deletePDF: async (pdfPath: string): Promise<void> => {
    await apiClient.delete(`/pdf/${encodeURIComponent(pdfPath)}`);
  },

  // Generate exercises from PDF
  generateExercises: async (params: GenerateExercisesRequest) => {
    const response = await apiClient.post('/exercises/generate', params);
    return response.data;
  },
};
