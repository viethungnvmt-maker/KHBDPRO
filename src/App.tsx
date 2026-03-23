/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
  UserRound,
  LogOut,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Account = {
  username: string;
  password: string;
  displayName: string;
};

type SessionUser = Pick<Account, 'username' | 'displayName'>;

const SUBJECTS = [
  'Tin học', 'Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học',
  'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD', 'Công nghệ', 'Âm nhạc', 'Mỹ thuật', 'Thể dục'
];

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const BOOK_SERIES = ['Kết nối tri thức', 'Chân trời sáng tạo', 'Cánh diều', 'Khác'];

const ACCOUNTS: Account[] = [
  { username: 'VIETHUNG', password: '123456', displayName: 'VIETHUNG' }
];

const API_KEY_STORAGE_KEY = 'khbd-pro-api-key';
const SESSION_STORAGE_KEY = 'khbd-pro-session-user';

function readStoredValue(key: string) {
  if (typeof window === 'undefined') return '';

  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writeStoredValue(key: string, value: string) {
  if (typeof window === 'undefined') return;

  try {
    if (value) {
      window.localStorage.setItem(key, value);
      return;
    }

    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors to keep the UI usable.
  }
}

function readStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    const account = ACCOUNTS.find(item => item.username === parsed.username);
    if (!account) return null;

    return { username: account.username, displayName: account.displayName };
  } catch {
    return null;
  }
}

function writeStoredUser(user: SessionUser | null) {
  if (typeof window === 'undefined') return;

  try {
    if (user) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      return;
    }

    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors to keep the UI usable.
  }
}

function getInjectedApiKey() {
  const runtime = globalThis as typeof globalThis & {
    process?: {
      env?: Record<string, string | undefined>;
    };
  };

  return runtime.process?.env?.GEMINI_API_KEY?.trim() ?? '';
}

function maskSecret(value: string) {
  if (!value) return '';
  if (value.length <= 8) return '********';

  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

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
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(() => readStoredUser());
  const [loginForm, setLoginForm] = useState({
    username: ACCOUNTS[0]?.username ?? '',
    password: ACCOUNTS[0]?.password ?? ''
  });
  const [loginError, setLoginError] = useState('');
  const [apiKey, setApiKey] = useState(() => readStoredValue(API_KEY_STORAGE_KEY));
  const [apiKeyDraft, setApiKeyDraft] = useState(() => readStoredValue(API_KEY_STORAGE_KEY));
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    if (isApiKeyModalOpen) {
      setApiKeyDraft(apiKey);
    }
  }, [apiKey, isApiKeyModalOpen]);

  const handleGenerate = async () => {
    if (!lessonName || !coreContent) return;

    const activeApiKey = apiKey.trim() || getInjectedApiKey();
    if (!activeApiKey) {
      setResult('Vui lòng cài đặt API Key trước khi tạo bài dạy.');
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: activeApiKey });
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
      console.error('Error generating lesson plan:', error);
      setResult('Đã có lỗi xảy ra trong quá trình tạo bài dạy. Vui lòng thử lại.');
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

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const matchedAccount = ACCOUNTS.find(
      account =>
        account.username.toUpperCase() === loginForm.username.trim().toUpperCase() &&
        account.password === loginForm.password
    );

    if (!matchedAccount) {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng.');
      return;
    }

    const sessionUser = { username: matchedAccount.username, displayName: matchedAccount.displayName };
    setCurrentUser(sessionUser);
    writeStoredUser(sessionUser);
    setLoginError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({
      username: ACCOUNTS[0]?.username ?? '',
      password: ACCOUNTS[0]?.password ?? ''
    });
    setLoginError('');
    setResult('');
    writeStoredUser(null);
  };

  const handleSaveApiKey = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextValue = apiKeyDraft.trim();
    setApiKey(nextValue);
    writeStoredValue(API_KEY_STORAGE_KEY, nextValue);
    setIsApiKeyModalOpen(false);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    setApiKeyDraft('');
    writeStoredValue(API_KEY_STORAGE_KEY, '');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 text-slate-800 md:p-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl shadow-indigo-100/60 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-500 to-yellow-400 px-3.5 py-2 text-sm font-semibold text-slate-900">
              <Gem size={14} className="text-amber-950" />
              <span>VIP đã kích hoạt</span>
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-200">
                <BookOpen size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-indigo-950 md:text-4xl">
                  KHBD AI PRO V4.0
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Đăng nhập để sử dụng hệ thống. Sau khi vào app, tên đăng nhập sẽ hiển thị ngay trên header.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <UserRound size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                  Danh sách tài khoản và mật khẩu
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {ACCOUNTS.map((account, index) => (
                  <div
                    key={account.username}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {index === 0 ? 'Tài khoản đầu tiên' : `Tài khoản ${index + 1}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Tên đăng nhập: <span className="font-semibold text-slate-700">{account.username}</span>
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                      <span>Mật khẩu:</span>
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] tracking-[0.2em] text-white">
                        {account.password}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white">
              <UserRound size={14} className="text-slate-300" />
              <span>Đăng nhập hệ thống</span>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  value={loginForm.username}
                  onChange={(event) => {
                    setLoginForm(prev => ({ ...prev, username: event.target.value }));
                    setLoginError('');
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(event) => {
                    setLoginForm(prev => ({ ...prev, password: event.target.value }));
                    setLoginError('');
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              {loginError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-colors hover:bg-indigo-700"
              >
                <Play size={18} fill="currentColor" />
                ĐĂNG NHẬP VÀO HỆ THỐNG
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm leading-6 text-indigo-800">
              Tài khoản đầu tiên là <span className="font-bold">VIETHUNG</span> với mật khẩu <span className="font-bold">123456</span>.
              Khi đăng nhập thành công, tên <span className="font-bold">VIETHUNG</span> sẽ hiện ở header.
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-800">
      <header className="sticky top-0 z-50 flex flex-col gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-200">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-900">
              KHBD AI <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600">PRO V4.0</span>
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
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
            <span className="uppercase tracking-wide">{currentUser.displayName}</span>
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
            onClick={() => setIsApiKeyModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-100 shadow-sm transition-colors hover:bg-slate-700"
          >
            <Settings size={15} className="text-slate-300" />
            <span>Cài đặt API Key</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-red-200 hover:text-red-600"
            aria-label="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4">
              <Settings size={18} className="text-indigo-600" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Cấu hình bài soạn</h2>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500">
                  Tên bài soạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lessonName}
                  onChange={(event) => setLessonName(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tên bài học..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Môn học *</label>
                  <select
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  >
                    {SUBJECTS.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Lớp</label>
                  <select
                    value={grade}
                    onChange={(event) => setGrade(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  >
                    {GRADES.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Bộ sách</label>
                  <select
                    value={bookSeries}
                    onChange={(event) => setBookSeries(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  >
                    {BOOK_SERIES.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Số tiết</label>
                  <input
                    type="number"
                    value={periods}
                    onChange={(event) => setPeriods(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-xs font-bold uppercase text-slate-500">
                  Nội dung cốt lõi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={coreContent}
                  onChange={(event) => setCoreContent(event.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập nội dung chính, yêu cầu cần đạt..."
                />
              </div>

              <div className="pt-2">
                <p className="mb-3 text-xs font-bold uppercase text-slate-500">Tùy chọn nâng cao</p>
                <div className="grid grid-cols-2 gap-3">
                  <OptionCard icon={<Cpu size={16} />} label="Năng lực số" subLabel="Theo CV 3456" checked={options.digitalCompetency} onChange={() => setOptions(prev => ({ ...prev, digitalCompetency: !prev.digitalCompetency }))} />
                  <OptionCard icon={<Zap size={16} />} label="Tích hợp AI" subLabel="Ứng dụng AI" checked={options.aiIntegration} onChange={() => setOptions(prev => ({ ...prev, aiIntegration: !prev.aiIntegration }))} />
                  <OptionCard icon={<Zap size={16} />} label="Khởi động" subLabel="Sôi nổi" checked={options.warmUp} onChange={() => setOptions(prev => ({ ...prev, warmUp: !prev.warmUp }))} />
                  <OptionCard icon={<Lightbulb size={16} />} label="Phương pháp" subLabel="Tích cực" checked={options.activeMethod} onChange={() => setOptions(prev => ({ ...prev, activeMethod: !prev.activeMethod }))} />
                  <OptionCard icon={<RefreshCw size={16} />} label="Củng cố" subLabel="Bộ câu hỏi" checked={options.consolidation} onChange={() => setOptions(prev => ({ ...prev, consolidation: !prev.consolidation }))} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Trạng thái API key</p>
                <p className="mt-1 text-sm text-slate-700">
                  {apiKey ? `Đã lưu: ${maskSecret(apiKey)}` : 'Chưa có API key lưu trong trình duyệt này.'}
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white transition-all shadow-lg active:scale-[0.98]",
                    isLoading ? "cursor-not-allowed bg-slate-400" : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
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
                  className="flex w-full items-center justify-center gap-2 py-2 text-xs font-bold uppercase text-slate-500 transition-colors hover:text-red-500"
                >
                  <Trash2 size={14} />
                  Xóa tất cả
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <h3 className="mb-2 flex items-center gap-1 text-xs font-bold uppercase text-indigo-900">
              <Lightbulb size={14} /> Ghi chú
            </h3>
            <p className="text-[11px] italic leading-relaxed text-indigo-700">
              Giáo viên luôn kiểm tra nội dung trước khi đưa vào sử dụng thực tế trên lớp học. Hệ thống AI hỗ trợ soạn thảo mẫu, cần điều chỉnh phù hợp với đối tượng học sinh.
            </p>
          </div>
        </section>

        <section className="space-y-6 lg:col-span-8">
          <div className="flex min-h-[600px] flex-col rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Kết quả soạn thảo</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!result}
                  className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all", result ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "cursor-not-allowed text-slate-300")}
                >
                  {copySuccess ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copySuccess ? 'Đã sao chép' : 'SAO CHÉP'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!result}
                  className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all", result ? "bg-indigo-600 text-white hover:bg-indigo-700" : "cursor-not-allowed bg-slate-200 text-slate-400")}
                >
                  <Download size={14} />
                  TẢI FILE
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-slate-400">
                  <div className="relative">
                    <RefreshCw className="animate-spin text-indigo-200" size={64} />
                    <Cpu className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-600">AI đang xử lý dữ liệu...</p>
                    <p className="text-xs">Quá trình này có thể mất 10-20 giây</p>
                  </div>
                </div>
              ) : result ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="prose prose-slate max-w-none prose-sm md:prose-base">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="mb-4 border-b pb-2 text-xl font-bold text-indigo-900" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="mt-6 mb-3 flex items-center gap-2 text-lg font-bold text-slate-800" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="mt-4 mb-2 text-md font-bold text-slate-700" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="mb-4 list-disc space-y-1 pl-5" {...props} />,
                      li: ({ node, ...props }) => <li className="text-slate-600" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                    }}
                  >
                    {result}
                  </ReactMarkdown>
                </motion.div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-4 py-20 text-slate-300">
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

      <footer className="mx-auto max-w-7xl p-6 text-center text-[10px] uppercase tracking-[0.2em] text-slate-400">
        &copy; 2026 KHBD AI PRO - Nền tảng hỗ trợ giáo dục thông minh
      </footer>

      <AnimatePresence>
        {isApiKeyModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Cài đặt API Key</h2>
                  <p className="mt-1 text-sm text-slate-500">Nhập Gemini API key để dùng nút tạo bài dạy ngay trong trình duyệt này.</p>
                </div>
                <button type="button" onClick={() => setIsApiKeyModalOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700" aria-label="Đóng">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveApiKey} className="space-y-5 px-6 py-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Trạng thái hiện tại</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {apiKey ? `Đã lưu: ${maskSecret(apiKey)}` : 'Chưa có API key nào được lưu.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Gemini API Key</label>
                  <input
                    type="password"
                    value={apiKeyDraft}
                    onChange={(event) => setApiKeyDraft(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                    placeholder="Nhập API key..."
                  />
                  <p className="text-xs leading-5 text-slate-500">Khóa sẽ được lưu cục bộ trên thiết bị này để lần sau không cần nhập lại.</p>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={handleClearApiKey} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-red-200 hover:text-red-600">
                    Xóa khóa đã lưu
                  </button>
                  <button type="submit" className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700">
                    Lưu API Key
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionCard({
  icon,
  label,
  subLabel,
  checked,
  onChange
}: {
  icon: React.ReactNode;
  label: string;
  subLabel: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
        checked ? "border-indigo-200 bg-indigo-50 ring-1 ring-indigo-200" : "border-slate-200 bg-white hover:border-indigo-200"
      )}
    >
      <div className={cn("rounded-lg p-2 transition-colors", checked ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600")}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className={cn("truncate text-[11px] font-bold", checked ? "text-indigo-900" : "text-slate-600")}>{label}</p>
          {checked && <CheckCircle2 size={12} className="flex-shrink-0 text-indigo-600" />}
        </div>
        <p className="text-[9px] font-medium text-slate-400">{subLabel}</p>
      </div>
    </button>
  );
}
