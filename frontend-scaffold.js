import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  {
    path: 'app/(dashboard)/admin/employees/page.tsx',
    title: 'Employee Management',
    entity: 'Employee',
    fields: ['name', 'role', 'salary', 'shift']
  },
  {
    path: 'app/(dashboard)/admin/customers/page.tsx',
    title: 'Customer Management',
    entity: 'Customer',
    fields: ['name', 'email', 'phone', 'loyaltyPoints']
  },
  {
    path: 'app/(dashboard)/admin/menu/page.tsx',
    title: 'Menu Management',
    entity: 'MenuItem',
    fields: ['name', 'category', 'price', 'status']
  },
  {
    path: 'app/(dashboard)/admin/settings/page.tsx',
    title: 'Restaurant Settings',
    entity: 'Restaurant',
    fields: ['name', 'address', 'gstNumber', 'contact']
  }
];

const generatePage = (page) => {
  return `'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

export default function ${page.entity}Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const endpoint = '/${page.entity.toLowerCase()}s';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(endpoint);
      setData(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // await axiosInstance.put(\`\${endpoint}/\${editingId}\`, formData); // Update endpoint not fully implemented in basic scaffold, but concept stands
        alert('Update functionality to be connected to API');
      } else {
        await axiosInstance.post(endpoint, formData);
      }
      setShowModal(false);
      setFormData({});
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">${page.title}</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" /> Add ${page.entity}
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                ${page.fields.map(f => `<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${f}</th>`).join('')}
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  ${page.fields.map(f => `<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{item['${f}'] || '-'}</td>`).join('')}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 className="w-4 h-4" /></button>
                    <button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={${page.fields.length + 1}} className="px-6 py-8 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} ${page.entity}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              ${page.fields.map(f => `
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">${f}</label>
                <input 
                  type="text" 
                  value={formData['${f}'] || ''}
                  onChange={(e) => setFormData({...formData, ['${f}']: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              `).join('')}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}`;
};

const run = () => {
  pages.forEach(page => {
    const fullPath = path.join(__dirname, 'frontend', page.path);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, generatePage(page));
  });
  console.log('Frontend scaffolding complete');
};

run();
