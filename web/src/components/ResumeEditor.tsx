import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, ClipboardDocumentIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useApplications, JobApplication } from '@/context/ApplicationContext';

interface ResumeEditorProps {
    initialContent: string;
    isOpen: boolean;
    onClose: () => void;
    onTailor?: (currentDetails: string) => Promise<string>;
    isTailoring?: boolean;
    jobApplyLink?: string;
    jobTitle?: string;
    companyName?: string;
    jobType?: string;
}

export default function ResumeEditor({
    initialContent,
    isOpen,
    onClose,
    onTailor,
    isTailoring = false,
    jobApplyLink,
    jobTitle,
    companyName,
    jobType
}: ResumeEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [view, setView] = useState<'edit' | 'preview'>('edit');
    const [showApplyConfirmation, setShowApplyConfirmation] = useState(false);
    const { addApplication } = useApplications();

    // Update content if initialContent changes (e.g. after AI generation)
    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    if (!isOpen) return null;

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Custom_Resume.md';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        alert("Copied to clipboard!");
    };

    const handleApplyClick = () => {
        if (jobApplyLink) {
            window.open(jobApplyLink, '_blank');
            setShowApplyConfirmation(true);
        }
    };

    const confirmApplication = () => {
        if (jobTitle && companyName) {
            const newApp: JobApplication = {
                id: Date.now().toString(),
                jobTitle: jobTitle,
                companyName: companyName,
                dateApplied: new Date().toISOString().split('T')[0],
                status: 'Applied',
                applicationLink: jobApplyLink || '#',
                resumeVersion: 'v1.0', // Could be dynamic if we tracked versions
                coverLetterPdf: 'None',
                pointOfContact: '-',
                comments: 'Applied via JAI Dashboard',
                jobType: (jobType as JobApplication['jobType']) || 'Full-time'
            };
            addApplication(newApp);
        }
        setShowApplyConfirmation(false);
        onClose(); // Close editor after applying
    };

    // Enhanced Markdown to HTML converter for professional resume layout
    const renderPreview = (md: string) => {
        let html = md
            // 1. Header: Name (Assume first H1 or first line is name)
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold uppercase tracking-wider mb-1 text-center">$1</h1>')

            // 2. Contact Info: (Assume lines with | or emails/phones below name) - naive check
            // We can wrap the whole second line in a centered div if it looks like contact info
            // For now, let's just style H2 as Section Headers

            // 3. Section Headers (H2 or H3): Uppercase, Border Bottom
            .replace(/^## (.*$)/gim, '<h2 class="text-sm font-bold uppercase tracking-widest border-b-2 border-black mt-4 mb-2 pb-0.5">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mt-2 mb-1">$1</h3>')

            // 4. Bold Text
            .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')

            // 5. Lists: Compact
            .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc marker:text-black mb-0.5 leading-snug">$1</li>')

            // 6. Line Breaks
            .replace(/\n/gim, '<br />');

        return { __html: html };
    };

    const handlePrint = () => {
        // 1. Clean the content (Remove code blocks if present)
        const cleanContent = content
            .replace(/^```markdown\s*/i, '') // Remove start block
            .replace(/^```\s*/gm, '')        // Remove end block or other blocks
            .trim();

        // 2. Render HTML for print (reuse the preview logic but maybe simpler/stricter)
        const { __html: bodyHtml } = renderPreview(cleanContent);

        // 3. Open a new window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Please allow popups to print.");
            return;
        }

        // 4. Write the full HTML document
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Resume - ${new Date().toLocaleDateString()}</title>
                <style>
                    /* Reset & Base */
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: "Times New Roman", Times, serif; /* Professional Serif */
                        font-size: 11pt;
                        line-height: 1.3;
                        color: #000;
                        background: #fff;
                    }

                    /* Page Setup */
                    @page {
                        size: auto;
                        margin: 15mm 15mm 15mm 15mm; /* Standard Margins */
                    }

                    /* Content Container */
                    .resume-container {
                        width: 100%;
                        max-width: 800px; /* Optional constraint */
                        margin: 0 auto;
                    }

                    /* Typography Overrides based on User Feedback */
                    h1 {
                        font-size: 24pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        text-align: center;
                        margin-bottom: 2mm;
                        margin-top: 0;
                        letter-spacing: 1px;
                    }

                    /* Contact Info (If detected, usually paragraph after H1) */
                    p {
                        margin: 0 0 2mm 0;
                    }

                    /* Section Headers */
                    h2 {
                        font-size: 12pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        border-bottom: 1px solid #000;
                        margin-top: 5mm;
                        margin-bottom: 2mm;
                        padding-bottom: 1mm;
                        letter-spacing: 1px;
                    }

                    h3 {
                        font-size: 11pt;
                        font-weight: bold;
                        margin-top: 3mm;
                        margin-bottom: 1mm;
                    }

                    /* Lists */
                    ul {
                        margin: 1mm 0 3mm 0;
                        padding-left: 5mm;
                    }
                    li {
                        margin-bottom: 1mm;
                        text-align: justify;
                    }
                </style>
            </head>
            <body>
                <div class="resume-container">
                    ${bodyHtml}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        // Short delay to ensure styles align, then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 relative">

                {/* Loader Overlay */}
                {isTailoring && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="w-64 space-y-4">
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 animate-progress origin-left"></div>
                            </div>
                            <p className="text-sm font-medium text-center text-gray-600 animate-pulse">
                                AI is tailoring your resume...
                            </p>
                        </div>
                    </div>
                )}

                {/* Confirmation Popup */}
                {showApplyConfirmation && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 animate-in zoom-in duration-200">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                                <SparklesIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Did you apply?</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                If you applied, we can automatically add this job to your tracker so you don't lose track!
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowApplyConfirmation(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    No, not yet
                                </button>
                                <button
                                    onClick={confirmApplication}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Yes, I applied!
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Resume Editor</h2>
                        <p className="text-sm text-gray-500">Edit your resume before tailoring it to the job.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Tailor Button */}
                        {onTailor && (
                            <button
                                onClick={async () => {
                                    const newContent = await onTailor(content);
                                    if (newContent) {
                                        setContent(newContent);
                                        setView('preview');
                                    }
                                }}
                                disabled={isTailoring}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mr-2"
                            >
                                <SparklesIcon className="h-4 w-4 mr-2" />
                                Tailor to Job
                            </button>
                        )}
                        <button
                            onClick={handleCopy}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Copy to Clipboard"
                        >
                            <ClipboardDocumentIcon className="h-5 w-5" />
                        </button>

                        {/* Apply Button */}
                        {jobApplyLink && (
                            <button
                                onClick={handleApplyClick}
                                className="flex items-center px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                Apply to Job
                            </button>
                        )}

                        <button
                            onClick={handlePrint}
                            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                            Save as PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 px-6 py-2 bg-gray-50 border-b border-gray-100">
                    <button
                        onClick={() => setView('edit')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'edit'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Editor
                    </button>
                    <button
                        onClick={() => setView('preview')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'preview'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Preview
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative print:overflow-visible print:h-auto">
                    {view === 'edit' ? (
                        <textarea
                            className="w-full h-full p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed text-gray-800 bg-gray-50/30 print:hidden"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="# Your Resume Content..."
                        />
                    ) : (
                        <div className="w-full h-full p-8 overflow-y-auto bg-white print:p-0 print:overflow-visible" id="resume-preview-content">
                            <div
                                className="resume-content text-sm leading-snug text-black font-serif"
                                dangerouslySetInnerHTML={renderPreview(content)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
