import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            // If total pages is less than max pages to show, show all pages
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);
            
            // Calculate start and end of page numbers to show
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            
            // Adjust if we're near the beginning or end
            if (currentPage <= 2) {
                endPage = 4;
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - 3;
            }
            
            // Add ellipsis if needed
            if (startPage > 2) {
                pageNumbers.push('...');
            }
            
            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            
            // Add ellipsis if needed
            if (endPage < totalPages - 1) {
                pageNumbers.push('...');
            }
            
            // Always show last page
            pageNumbers.push(totalPages);
        }
        
        return pageNumbers;
    };
    
    const pageNumbers = getPageNumbers();
    
    return (
        <div className="flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* Previous button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <span className="sr-only">Previous</span>
                    <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                {pageNumbers.map((pageNumber, index) => (
                    <React.Fragment key={index}>
                        {pageNumber === '...' ? (
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                            </span>
                        ) : (
                            <button
                                onClick={() => onPageChange(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === pageNumber
                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {pageNumber}
                            </button>
                        )}
                    </React.Fragment>
                ))}
                
                {/* Next button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <span className="sr-only">Next</span>
                    <FaChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </nav>
        </div>
    );
} 