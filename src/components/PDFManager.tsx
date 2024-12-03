import React, { useState, useEffect } from 'react';
import { pdfAPI, PDFMetadata } from '../api/pdfs';
import { exerciseAPI } from '../api/exercises';
import { useToast } from '../hooks/useToast';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';

const PDFManager: React.FC = () => {
  const [pdfs, setPdfs] = useState<Record<string, PDFMetadata>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingExercises, setGeneratingExercises] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      const pdfList = await pdfAPI.listPDFs();
      setPdfs(pdfList);
    } catch (error) {
      toast.error('Error loading PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await pdfAPI.uploadPDF(file);
      toast.success('PDF uploaded successfully!');
      loadPDFs(); // Refresh the list
    } catch (error) {
      toast.error('Error uploading PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (pdfPath: string) => {
    try {
      await pdfAPI.deletePDF(pdfPath);
      toast.success('PDF deleted successfully!');
      loadPDFs(); // Refresh the list
    } catch (error) {
      toast.error('Error deleting PDF');
    }
  };

  const handleGenerateExercises = async (pdfPath: string, difficulty: string) => {
    setGeneratingExercises(true);
    try {
      const exercises = await exerciseAPI.generateExercises({
        pdf_path: pdfPath,
        difficulty,
        count: 5, // Default count
      });
      toast.success(`Generated ${exercises.length} exercises!`);
    } catch (error) {
      toast.error('Error generating exercises');
    } finally {
      setGeneratingExercises(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Learning Materials</h2>
        <div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload"
            disabled={uploading}
          />
          <label htmlFor="pdf-upload">
            <Button
              as="span"
              variant="primary"
              disabled={uploading}
              className="cursor-pointer"
            >
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(pdfs).map(([path, metadata]) => (
          <Card key={path} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{metadata.original_name}</h3>
                <p className="text-sm text-gray-600">
                  Difficulty: {metadata.difficulty}
                </p>
                <p className="text-sm text-gray-600">
                  Uploaded: {new Date(metadata.upload_date).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(path)}
              >
                Delete
              </Button>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {metadata.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => handleGenerateExercises(path, metadata.difficulty)}
              disabled={generatingExercises}
            >
              {generatingExercises ? 'Generating...' : 'Generate Exercises'}
            </Button>
          </Card>
        ))}
      </div>

      {Object.keys(pdfs).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No PDFs uploaded yet. Upload some learning materials to get started!
        </div>
      )}
    </div>
  );
};

export default PDFManager;
