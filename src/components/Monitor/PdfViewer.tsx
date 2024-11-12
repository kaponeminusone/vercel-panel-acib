// src/PdfViewer.tsx
import { useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Maximize, ExternalLink, X } from 'lucide-react'; // Importamos los íconos de lucide-react
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerProps {
  pdfFile: string | null; // Prop para recibir la URL del PDF
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfFile }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function toggleModal() {
    setIsModalOpen(!isModalOpen);
  }

  function openInNewTab() {
    if (pdfFile) {
      window.open(pdfFile, '_blank');
    }
  }

  return (
    <div>
      <div className="flex mb-0 justify-end">
        {/* Botón para abrir modal */}
        <button 
          className="flex border-none items-center bg-transparent px-2 py-1 hover:text-blue-700"
          onClick={toggleModal}
        >
          <Maximize className="w-5 h-5 mr-1" />
        </button>

        {/* Botón para abrir en otra pestaña */}
        <button 
          className="flex border-none items-center bg-transparent px-2 py-1 hover:text-green-700"
          onClick={openInNewTab}
        >
          <ExternalLink className="w-5 h-5 mr-1" />
        </button>
      </div>

      {pdfFile ? (
        <>
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page 
                key={`page_${index + 1}`} 
                pageNumber={index + 1} 
                width={600}  // Ajusta el ancho de la página en el visor normal
              />
            ))}
          </Document>
        </>
      ) : (
        <p>No hay PDF disponible.</p> // Mensaje cuando no hay PDF
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50">
          <div className="relative bg-white p-6 rounded-lg shadow-lg w-700 max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Botón para cerrar el modal con z-index alto */}
            <button 
              className="top-4 border-none right-4 text-black-500 hover:text-gray-700 z-3 bg-white" // z-60 para tener z-index superior
              onClick={toggleModal}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Contenido del visor de PDF en el modal */}
            {pdfFile ? (
              <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (el, index) => (
                  <Page 
                    key={`page_${index + 1}`} 
                    pageNumber={index + 1} 
                    width={800}  // Ajustamos el ancho del PDF dentro del modal
                  />
                ))}
              </Document>
            ) : (
              <p>No hay PDF disponible.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
