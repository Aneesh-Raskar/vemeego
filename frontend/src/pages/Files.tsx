
import React from 'react';
import { FileText, MoreHorizontal, Download, Share2, Filter } from 'lucide-react';

const Files = () => {
  const files = [
    { name: 'Q3_Product_Roadmap.pdf', type: 'PDF', size: '2.4 MB', date: 'Today, 10:30 AM', owner: 'Alex Morgan' },
    { name: 'Design_System_v2.fig', type: 'Figma', size: '145 MB', date: 'Yesterday', owner: 'Marcus Johnson' },
    { name: 'Budget_2025.xlsx', type: 'Excel', size: '850 KB', date: 'Oct 24, 2024', owner: 'Sarah Chen' },
    { name: 'Marketing_Assets.zip', type: 'ZIP', size: '1.2 GB', date: 'Oct 22, 2024', owner: 'Emily Davis' },
    { name: 'Meeting_Notes_Oct.docx', type: 'Word', size: '24 KB', date: 'Oct 20, 2024', owner: 'Alex Morgan' },
  ];

  return (
    <div className="h-full p-4 md:p-8 overflow-y-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Files & Documents</h1>
          <p className="text-slate-500">Manage and share your team's resources.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Filter
          </button>
          <button className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">
            Upload File
          </button>
        </div>
      </header>

      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {files.map((file, i) => (
                <tr key={i} className="hover:bg-white/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FileText size={20} />
                      </div>
                      <span className="font-medium text-slate-700">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{file.owner}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{file.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{file.size}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Download size={16} /></button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Share2 size={16} /></button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><MoreHorizontal size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Files;
