/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, 
  Settings, 
  FileText, 
  Copy, 
  Download, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Gem,
  Moon,
  Zap,
  Cpu,
  RefreshCw,
  Lightbulb,
  Check,
  UserRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Constants
const SUBJECTS = [
  'Tin học', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 
  'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD', 'Công nghệ', 'Âm nhạc', 'Mỹ thuật', 'Thể dục'
];

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const BOOK_SERIES = ['Kết nối tri thức', 'Chân trời sáng tạo', 'Cánh diều', 'Khác'];

export default function App() {
  const [lessonName, setLessonName] = useState('Bài 2. Lưu trữ và trao đổi thông tin');
  const [subject, setSubject] = useState('Tin học');
  const [grade, setGrade] = useState('6');
  const [bookSeries, setBookSeries] = useState('Kết nối tri thức');
  const [periods, setPeriods] = useState('1');
  const [coreContent, setCoreContent] = useState('- Nêu được mối quan hệ giữa thông tin và dữ liệu.\n- Nêu được ví dụ minh họa tầm quan trọng của thông tin.\n- Tích hợp sơ đồ tư duy vào nội dung bài học');
  
  const [options, setOptions] = useState({
    digitalCompetency: true,
    warmUp: true,
    activeMethod: true,
    consolidation: true,
    aiIntegration: true
  });

  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleGenerate = async () => {
    if (!lessonName || !coreContent) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Bạn là một chuyên gia giáo dục Việt Nam am hiểu về đổi mới phương pháp dạy học. 
        Hãy soạn một kế hoạch bài dạy (giáo án) chi tiết theo chuẩn Công văn 5512 cho:
        - Tên bài: ${lessonName}
        - Môn học: ${subject}
        - Lớp: ${grade}
        - Bộ sách: ${bookSeries}
        - Số tiết: ${periods}
        - Nội dung cốt lõi: ${coreContent}
        
        Tùy chọn nâng cao:
        ${options.digitalCompetency ? '- Tích hợp Năng lực số (theo CV 3456)' : ''}
        ${options.aiIntegration ? '- Tích hợp ứng dụng Trí tuệ nhân tạo (AI) vào dạy và học' : ''}
        ${options.warmUp ? '- Có hoạt động Khởi động sôi nổi' : ''}
        ${options.activeMethod ? '- Sử dụng các Phương pháp dạy học tích cực' : ''}
        ${options.consolidation ? '- Có bộ câu hỏi Củng cố bài học' : ''}

        Yêu cầu cấu trúc bài soạn gồm các hoạt động chính:
        1. Hoạt động 1: Khởi động (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện)
        2. Hoạt động 2: Hình thành kiến thức mới (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện)
        3. Hoạt động 3: Luyện tập (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện)
        4. Hoạt động 4: Vận dụng (Mục tiêu, Nội dung, Sản phẩm, Tổ chức thực hiện)

        Lưu ý: 
        - Trình bày chuyên nghiệp, khoa học.
        - Chú trọng vào các bước "Tổ chức thực hiện" (Giao nhiệm vụ, Thực hiện nhiệm vụ, Báo cáo thảo luận, Kết luận nhận định).
        - Kết quả trả về bằng Tiếng Việt, định dạng Markdown.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setResult(response.text || 'Không có kết quả trả về.');
    } catch (error) {
      console.error("Error generating lesson plan:", error);
      setResult("Đã có lỗi xảy ra trong quá trình tạo bài dạy. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lessonName || 'giao-an'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setLessonName('');
    setCoreContent('');
    setResult('');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-indigo-900 flex items-center gap-2">
              KHBD AI <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">PRO V4.0</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Phát triển bởi: Thầy giáo Nguyễn Việt Hùng
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-sm shadow-amber-200/80">
            <Gem size={14} className="text-amber-950" />
            <span>VIP đã kích hoạt</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-800 px-3.5 py-2 text-sm font-semibold text-white shadow-sm">
            <UserRound size={14} className="text-slate-300" />
            <span className="uppercase tracking-wide">VIETHUNG</span>
          </div>
          <button
            type="button"
            aria-label="Chế độ hiển thị"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-800 text-slate-200 shadow-sm transition-colors hover:bg-slate-700"
          >
            <Moon size={16} />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-sm transition-colors hover:bg-slate-700"
          >
            <Settings size={15} className="text-slate-300" />
            <span>Cài đặt API Key</span>
          </button>
        </div>

        {/* Mobile menu toggle or simplified info could go here */}
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Configuration */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center gap-2">
              <Settings size={18} className="text-indigo-600" />
              <h2 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Cấu hình bài soạn</h2>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  Tên bài soạn <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="Nhập tên bài học..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Môn học *</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Lớp</label>
                  <select 
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Bộ sách</label>
                  <select 
                    value={bookSeries}
                    onChange={(e) => setBookSeries(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm appearance-none"
                  >
                    {BOOK_SERIES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Số tiết</label>
                  <input 
                    type="number" 
                    value={periods}
                    onChange={(e) => setPeriods(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  Nội dung cốt lõi <span className="text-red-500">*</span>
                </label>
                <textarea 
                  rows={4}
                  value={coreContent}
                  onChange={(e) => setCoreContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none"
                  placeholder="Nhập nội dung chính, yêu cầu cần đạt..."
                />
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Tùy chọn nâng cao</p>
                <div className="grid grid-cols-2 gap-3">
                  <OptionCard 
                    icon={<Cpu size={16} />}
                    label="Năng lực số"
                    subLabel="Theo CV 3456"
                    checked={options.digitalCompetency}
                    onChange={() => setOptions(prev => ({...prev, digitalCompetency: !prev.digitalCompetency}))}
                  />
                  <OptionCard 
                    icon={<Zap size={16} />}
                    label="Tích hợp AI"
                    subLabel="Ứng dụng AI"
                    checked={options.aiIntegration}
                    onChange={() => setOptions(prev => ({...prev, aiIntegration: !prev.aiIntegration}))}
                  />
                  <OptionCard 
                    icon={<Zap size={16} />}
                    label="Khởi động"
                    subLabel="Sôi nổi"
                    checked={options.warmUp}
                    onChange={() => setOptions(prev => ({...prev, warmUp: !prev.warmUp}))}
                  />
                  <OptionCard 
                    icon={<Lightbulb size={16} />}
                    label="Phương pháp"
                    subLabel="Tích cực"
                    checked={options.activeMethod}
                    onChange={() => setOptions(prev => ({...prev, activeMethod: !prev.activeMethod}))}
                  />
                  <OptionCard 
                    icon={<RefreshCw size={16} />}
                    label="Củng cố"
                    subLabel="Bộ câu hỏi"
                    checked={options.consolidation}
                    onChange={() => setOptions(prev => ({...prev, consolidation: !prev.consolidation}))}
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]",
                    isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                  )}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      Đang tạo bài dạy...
                    </>
                  ) : (
                    <>
                      <Play size={20} fill="currentColor" />
                      BẮT ĐẦU TẠO BÀI DẠY
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleClear}
                  className="w-full py-2 text-slate-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase"
                >
                  <Trash2 size={14} />
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <h3 className="text-xs font-bold text-indigo-900 uppercase mb-2 flex items-center gap-1">
              <Lightbulb size={14} /> Ghi chú
            </h3>
            <p className="text-[11px] text-indigo-700 leading-relaxed italic">
              Giáo viên luôn kiểm tra nội dung trước khi đưa vào sử dụng thực tế trên lớp học. Hệ thống AI hỗ trợ soạn thảo mẫu, cần điều chỉnh phù hợp với đối tượng học sinh.
            </p>
          </div>
        </section>

        {/* Right Column - Result */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col min-h-[600px]">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                <h2 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Kết quả soạn thảo</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy}
                  disabled={!result}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                    result ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" : "text-slate-300 cursor-not-allowed"
                  )}
                >
                  {copySuccess ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copySuccess ? "Đã sao chép" : "SAO CHÉP"}
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={!result}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                    result ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <Download size={14} />
                  TẢI FILE
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-400">
                  <div className="relative">
                    <RefreshCw className="animate-spin text-indigo-200" size={64} />
                    <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-600">AI đang xử lý dữ liệu...</p>
                    <p className="text-xs">Quá trình này có thể mất 10-20 giây</p>
                  </div>
                </div>
              ) : result ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-slate max-w-none prose-sm md:prose-base"
                >
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold text-indigo-900 border-b pb-2 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold text-slate-700 mt-4 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="text-slate-600" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                    }}
                  >
                    {result}
                  </ReactMarkdown>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-300 py-20">
                  <FileText size={80} strokeWidth={1} />
                  <div className="text-center">
                    <p className="font-medium">Chưa có nội dung bài soạn</p>
                    <p className="text-xs">Vui lòng cấu hình ở cột bên trái và nhấn "Bắt đầu tạo bài dạy"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-6 text-center text-slate-400 text-[10px] uppercase tracking-[0.2em]">
        &copy; 2026 KHBD AI PRO - Nền tảng hỗ trợ giáo dục thông minh
      </footer>
    </div>
  );
}

function OptionCard({ icon, label, subLabel, checked, onChange }: { 
  icon: React.ReactNode, 
  label: string, 
  subLabel: string, 
  checked: boolean, 
  onChange: () => void 
}) {
  return (
    <button 
      onClick={onChange}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
        checked 
          ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" 
          : "bg-white border-slate-200 hover:border-indigo-200"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg transition-colors",
        checked ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={cn("text-[11px] font-bold truncate", checked ? "text-indigo-900" : "text-slate-600")}>{label}</p>
          {checked && <CheckCircle2 size={12} className="text-indigo-600 flex-shrink-0" />}
        </div>
        <p className="text-[9px] text-slate-400 font-medium">{subLabel}</p>
      </div>
    </button>
  );
}
