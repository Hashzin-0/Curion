'use client'

import { useState } from 'react';
import { Modal } from './feedback/Modal';
import { inputCls, labelCls } from './ui/SharedUI';
import { FileUp, Type, Loader2, Sparkles, FileText, BrainCircuit } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { parseResumeText } from '@/ai/flows/parse-resume-text-flow';

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportResumeModal({ isOpen, onClose }: ImportResumeModalProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('file');

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      setIsLoading(true);
      try {
        if (file.type === 'application/pdf') {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            if (arrayBuffer) {
              const pdfjs = await import('pdfjs-dist/build/pdf');
              pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
              const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
              let fullText = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(' ');
              }
              setText(fullText);
            }
          };
          reader.readAsArrayBuffer(file);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setText(result);
          };
          reader.readAsText(file);
        }
      } catch (error) {
        toast.error('Error reading file. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const parsedData = await parseResumeText({ text });
      // TODO: Do something with the parsed data
      toast.success('Resume imported and parsed successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to parse resume. Please check the content.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Resume">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={() => setActiveTab('file')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'file' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Upload File</button>
        <button onClick={() => setActiveTab('text')} className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'text' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Paste Text</button>
      </div>

      {activeTab === 'file' ? (
        <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 dark:border-slate-600'}`}>
          <input {...getInputProps()} />
          <FileUp className="mx-auto text-slate-400 mb-2" size={40} />
          <p className="font-bold text-slate-900 dark:text-white">{fileName || 'Drag & drop a file here, or click to select'}</p>
          <p className="text-sm text-slate-500">PDF, DOCX, TXT</p>
        </div>
      ) : (
        <div>
          <label htmlFor="resume-text" className={labelCls}>Paste your resume content below:</label>
          <textarea
            id="resume-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`${inputCls} min-h-[200px] mt-2`}
            placeholder="Paste your resume content here..."
          />
        </div>
      )}

      <div className="mt-8 flex justify-end items-center gap-4">
        <button onClick={onClose} className="font-bold text-slate-600 dark:text-slate-300">Cancel</button>
        <button onClick={handleImport} disabled={!text || isLoading} className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 className="animate-spin"/> : <BrainCircuit />}
          Import & Analyze
        </button>
      </div>
    </Modal>
  );
}
