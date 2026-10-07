import { request } from './apiClient';

export type OcrItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  confidence: number;
};

export type OcrResult = {
  fileId: string;
  merchantName: string;
  purchasedOn: string;
  items: OcrItem[];
  totalAmount: number;
  recognizedAt: string;
};

type OcrResponse = {
  fileId: number;
  merchantName: string;
  purchasedOn: string;
  items: OcrItem[];
  totalAmount: number;
  recognizedAt: string;
};

export async function recognizeReceipt(fileId: string): Promise<OcrResult> {
  const response = await request<OcrResponse>(`/api/v1/files/${fileId}/ocr`, {
    method: 'POST',
  });
  return { ...response, fileId: String(response.fileId) };
}
