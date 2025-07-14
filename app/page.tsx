"use client";

import React, { useRef, useState } from "react";
import { Sparkles, FileUp, BrainCog, UploadCloud, CheckCircle, AlertCircle } from "lucide-react";

// Utility to strip markdown formatting from a string
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italics
    .replace(/__(.*?)__/g, '$1') // underline
    .replace(/_(.*?)_/g, '$1') // italics/underline
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // links
    .replace(/\n/g, ' ') // newlines to space
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
}

// Define the expected analysis structure
interface Analysis {
  summary?: string;
  keySkills?: string[];
  missingSkills?: string[];
  formatting?: string;
  mistakes?: string[];
  suggestions?: string[];
  raw?: string;
}

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile App Developer",
    "DevOps Engineer",
    "QA Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "AI Engineer",
    "Cloud Engineer",
    "Embedded Systems Developer",
    "Game Developer",
    "Security Engineer",
    "Site Reliability Engineer",
    "Software Architect",
    "Other"
  ];
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  // Removed unused variable: analysisData

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadSuccess(null);
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data: { success: boolean; file?: { name?: string; path?: string }; error?: string } = await res.json();
      if (data.success) {
        setUploadSuccess("Resume uploaded successfully!");
        setUploadedFileName(data.file?.name || null);
        setUploadedFilePath(data.file?.path || null);
      } else {
        setUploadError(data.error || "Upload failed.");
        setUploadedFileName(null);
        setUploadedFilePath(null);
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Helper to render analysis field (string, array of strings, or array of objects)
  function renderAnalysisField(field: unknown, type?: string): React.ReactNode {
    if (field === undefined || field === null) return <span className="text-muted-foreground italic">No data</span>;
    if (typeof field === 'string') return <span className="text-muted-foreground text-base leading-relaxed">{stripMarkdown(field)}</span>;
    if (Array.isArray(field)) {
      if (field.length === 0) return <span className="text-muted-foreground italic">No data</span>;
      if (typeof field[0] === 'string') {
        let Icon = CheckCircle;
        if (type === 'mistakes') Icon = AlertCircle;
        if (type === 'suggestions') Icon = Sparkles;
        return (
          <ul className="space-y-2 mt-2">
            {field.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-base text-foreground">
                <Icon className={type === 'mistakes' ? 'text-red-400 mt-1 w-5 h-5' : type === 'suggestions' ? 'text-primary mt-1 w-5 h-5' : 'text-primary mt-1 w-5 h-5'} style={{minWidth: '20px', minHeight: '20px'}} />
                <span>{stripMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        );
      }
      if (typeof field[0] === 'object') {
        return (
          <ul className="space-y-2 mt-2">
            {field.map((obj: Record<string, unknown>, idx: number) => (
              <li key={idx} className="flex items-start gap-2 text-base text-foreground">
                <CheckCircle className="text-primary mt-1 w-5 h-5" style={{minWidth: '20px', minHeight: '20px'}} />
                <span>{Object.entries(obj).map(([k, v]) => <span key={k}>{stripMarkdown(`${k}: ${v}`)} </span>)}</span>
              </li>
            ))}
          </ul>
        );
      }
    }
    return <span className="text-muted-foreground italic">No data</span>;
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 flex flex-col">
      <div className="w-full max-w-4xl mx-auto mt-8 mb-12">
        <div className="relative w-full flex justify-center items-center">
          <h1
            className="text-4xl sm:text-5xl font-bold text-center mb-4 text-white drop-shadow-lg flex items-center justify-center gap-3"
          >
            Create a more effective and impactful resume with Resumind
          </h1>
        </div>
        <p className="text-lg text-center text-muted-foreground mb-10 max-w-2xl mx-auto">Upload your resume and let our AI provide a personalized summary, highlight your key skills, identify missing skills, and suggest real-world projects to boost your profile. Get actionable insights to stand out in your job search!</p>
        {/* Upload Resume Section */}
        <section className="w-full flex flex-col items-center justify-center mt-8">
          <div className="w-full rounded-2xl bg-background/80 border border-border shadow-lg p-6 sm:p-8 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <FileUp className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">Upload Your Resume</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Support for PDF, Word, and Text documents (PDF, DOC, DOCX, TXT)</p>
            <div className="w-full">
              <label htmlFor="resume-upload" className="block cursor-pointer w-full">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white rounded-xl py-10 px-4 bg-background/60 hover:bg-background/40 transition-colors">
                  <UploadCloud className="w-12 h-12 mb-3 text-primary" />
                  <span className="text-base sm:text-lg text-muted-foreground mb-1">Drag and drop your resume here</span>
                  <span className="text-sm text-muted-foreground mb-4">or</span>
                  <span className="inline-flex items-center px-5 py-2 rounded-md border border-primary bg-primary/10 hover:bg-primary/20 text-white font-medium transition-colors">{uploading ? "Uploading..." : "Choose File"}</span>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </div>
              </label>
              {uploadSuccess && (
                <div className="mt-4 px-4 py-2 rounded bg-green-900/80 text-green-300 text-sm font-medium shadow">
                  {uploadSuccess}
                  {uploadedFileName && (
                    <span className="block mt-1 text-green-200">Filename: {uploadedFileName}</span>
                  )}
                </div>
              )}
              {uploadError && <p className="mt-4 text-red-400 text-sm">{uploadError}</p>}
            </div>
          </div>
        </section>
        {/* Role Selection and AI Analysis Button */}
        <div className="w-full max-w-4xl mx-auto mt-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label htmlFor="role-select" className="block mb-1 text-sm font-medium text-muted-foreground">Select Role</label>
            <select
              id="role-select"
              className="w-full rounded-md border border-border bg-background/80 px-4 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              <option value="" disabled>Select a role...</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <button
            className="mt-4 sm:mt-7 px-6 py-2 rounded-md bg-primary text-background font-semibold shadow hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2 justify-center"
            disabled={!selectedRole || !uploadSuccess || !uploadedFilePath || analysisLoading}
            onClick={async () => {
              setShowAnalysis(true);
              setAnalysis(null);
              setAnalysisError(null);
              setAnalysisLoading(true);
              try {
                const res = await fetch("/api/analyze", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    filePath: uploadedFilePath,
                    role: selectedRole,
                  }),
                });
                const data: { success: boolean; analysis?: Analysis; error?: string } = await res.json();
                if (data.success && data.analysis) {
                  setAnalysis(data.analysis);
                } else {
                  setAnalysis(null);
                  setAnalysisError(data.error || "AI analysis failed.");
                }
              } catch {
                setAnalysisError("AI analysis failed. Please try again.");
              } finally {
                setAnalysisLoading(false);
              }
            }}
          >
            <span className="text-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-black" />
              {analysisLoading ? "Analyzing..." : "AI Analysis"}
            </span>
          </button>
        </div>
      </div>
      {/* AI Analysis Cards */}
      {showAnalysis && (
        <div className="w-full max-w-4xl mx-auto mt-10 flex flex-col gap-6">
          {analysisLoading && (
            <div className="rounded-xl bg-background/80 border border-border shadow p-6 flex flex-col items-center justify-center text-lg text-muted-foreground">
              Analyzing your resume with AI...
            </div>
          )}
          {analysisError && (
            <div className="rounded-xl bg-background/80 border border-red-500 shadow p-6 flex flex-col items-center justify-center text-lg text-red-400">
              {analysisError}
            </div>
          )}
          {analysis && (
            <>
              {/* Summary Card */}
              <div className="rounded-2xl bg-background/90 border border-border shadow-lg p-8 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <BrainCog className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold">Summary</h3>
                </div>
                {renderAnalysisField(analysis.summary || analysis.raw)}
              </div>
              {/* Key Skills Card */}
              <div className="rounded-2xl bg-background/90 border border-border shadow-lg p-8 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold">Key Skills</h3>
                </div>
                {renderAnalysisField(analysis.keySkills, 'skills')}
              </div>
              {/* Missing Skills Card */}
              <div className="rounded-2xl bg-background/90 border border-border shadow-lg p-8 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-2xl font-bold">Missing Skills</h3>
                </div>
                {renderAnalysisField(analysis.missingSkills, 'missingSkills')}
              </div>
              {/* Formatting Card */}
              <div className="rounded-2xl bg-background/90 border border-border shadow-lg p-8 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <UploadCloud className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold">Formatting</h3>
                </div>
                {renderAnalysisField(analysis.formatting, 'formatting')}
              </div>
              {/* Mistakes Card */}
              <div className="rounded-2xl bg-background/90 border border-border shadow-lg p-8 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-2xl font-bold">Mistakes</h3>
                </div>
                {renderAnalysisField(analysis.mistakes, 'mistakes')}
              </div>
              {/* Suggestions Card */}
              <div className="rounded-2xl bg-background/90 border border-border shadow-lg p-8 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h3 className="text-2xl font-bold">Suggestions</h3>
                </div>
                {renderAnalysisField(analysis.suggestions, 'suggestions')}
              </div>
              {/* Raw Output (Debug) */}
              {analysis.raw && (
                <div className="rounded-xl bg-background/80 border border-yellow-500 shadow p-6 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2">Raw AI Output (Debug)</h3>
                  <pre className="text-xs text-yellow-300 whitespace-pre-wrap break-all">{analysis.raw}</pre>
                </div>
              )}
            </>
          )}
        </div>
      )}
      <main className="flex flex-col gap-[32px] items-center sm:items-start w-full max-w-2xl mx-auto flex-1">
      </main>
    </div>
  );
}
