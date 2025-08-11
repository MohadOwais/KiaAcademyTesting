import React from 'react';
import { 
    BsFileEarmark, 
    BsFileEarmarkPdf, 
    BsFileEarmarkWord, 
    BsFileEarmarkText,
    BsFileEarmarkSlides,
    BsFileEarmarkExcel,
    BsFileEarmarkImage,
    BsFileEarmarkZip,
    BsDownload,
    BsLink,
    BsFileEarmarkPlay
} from 'react-icons/bs';
import { baseUrl } from '@/app/utils/core';

interface LectureResourcesProps {
    resources: any[];
    loading: boolean;
}

const getFileIcon = (fileType: string) => {
    const type = fileType?.toLowerCase() || '';
    
    if (type.includes('pdf')) return <BsFileEarmarkPdf className="me-2 text-danger" />;
    if (type.includes('doc') || type.includes('docx')) return <BsFileEarmarkWord className="me-2 text-primary" />;
    if (type.includes('txt')) return <BsFileEarmarkText className="me-2 text-secondary" />;
    if (type.includes('ppt') || type.includes('pptx')) return <BsFileEarmarkSlides className="me-2 text-warning" />;
    if (type.includes('xls') || type.includes('xlsx')) return <BsFileEarmarkExcel className="me-2 text-success" />;
    if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('gif')) 
        return <BsFileEarmarkImage className="me-2 text-info" />;
    if (type.includes('zip') || type.includes('rar')) return <BsFileEarmarkZip className="me-2 text-dark" />;
    if (type.includes('link')) return <BsLink className="me-2 text-dark" />;
    if (type.includes('video')) return <BsFileEarmarkPlay className="me-2 text-dark" />;

    return <BsFileEarmark className="me-2 text-primary" />;
};

const getFileTypeLabel = (fileType: string) => {
    const type = fileType?.toLowerCase() || '';
    
    if (type.includes('pdf')) return 'PDF Document';
    if (type.includes('doc') || type.includes('docx')) return 'Word Document';
    if (type.includes('txt')) return 'Text File';
    if (type.includes('ppt') || type.includes('pptx')) return 'PowerPoint Presentation';
    if (type.includes('xls') || type.includes('xlsx')) return 'Excel Spreadsheet';
    if (type.includes('jpg') || type.includes('jpeg')) return 'JPEG Image';
    if (type.includes('png')) return 'PNG Image';
    if (type.includes('gif')) return 'GIF Image';
    if (type.includes('zip')) return 'ZIP Archive';
    if (type.includes('rar')) return 'RAR Archive';
    if (type.includes('link')) return 'Link';
    if (type.includes('video')) return 'Video';

    return 'File';
};

const LectureResources: React.FC<LectureResourcesProps> = ({ resources, loading }) => {
    if (loading) {
        return (
            <div className="resources-section mt-4">
                <h4 className="mb-3">Resources</h4>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!resources || resources.length === 0) {
        return (
            <div className="resources-section mt-4">
                <h4 className="mb-3">Resources</h4>
                <p className="text-muted">No resources available for this lecture.</p>
            </div>
        );
    }

    return (
        <div className="resources-section mt-4">
            <h4 className="mb-3">Resources</h4>
            <div className="list-group m-2">
                {resources.map((resource, index) => (
                    <a
                        key={resource.resource_id || index}
                        href={`${baseUrl}/lecture-resources/download/${resource.resource_id}`}
                        className="list-group-item list-group-item-action mb-2 border-0 shadow-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                {getFileIcon(resource.resource_type)}
                                <div>
                                    <div>{resource.resource_title}</div>
                                    <small className="text-muted">{getFileTypeLabel(resource.resource_type)}</small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <BsDownload className="text-muted" />
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default LectureResources; 