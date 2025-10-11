'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Car, MapPin } from 'lucide-react';

interface Fare {
  id: string;
  fromLocation: string;
  toLocation: string;
  vehicleType: 'FOUR_SEATER' | 'EIGHT_SEATER';
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FareForm {
  fromLocation: string;
  toLocation: string;
  vehicleType: 'FOUR_SEATER' | 'EIGHT_SEATER';
  price: string;
  isActive: boolean;
}

export default function AdminFares() {
  const [fares, setFares] = useState<Fare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FareForm>({
    fromLocation: '',
    toLocation: '',
    vehicleType: 'FOUR_SEATER',
    price: '',
    isActive: true
  });

  useEffect(() => {
    fetchFares();
  }, []);

  const fetchFares = async () => {
    try {
      const response = await fetch('/api/admin/fares');
      if (!response.ok) {
        throw new Error('Failed to fetch fares');
      }
      const data = await response.json();
      setFares(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromLocation || !formData.toLocation || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      const url = editingId ? `/api/admin/fares/${editingId}` : '/api/admin/fares';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save fare');
      }

      await fetchFares();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEdit = (fare: Fare) => {
    setFormData({
      fromLocation: fare.fromLocation,
      toLocation: fare.toLocation,
      vehicleType: fare.vehicleType,
      price: fare.price.toString(),
      isActive: fare.isActive
    });
    setEditingId(fare.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fare?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/fares/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete fare');
      }

      await fetchFares();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      fromLocation: '',
      toLocation: '',
      vehicleType: 'FOUR_SEATER',
      price: '',
      isActive: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Fare Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage taxi fares and pricing
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Fare' : 'Add New Fare'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Location *
                </label>
                <input
                  type="text"
                  value={formData.fromLocation}
                  onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Ashford"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To Location *
                </label>
                <input
                  type="text"
                  value={formData.toLocation}
                  onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Gatwick"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as 'FOUR_SEATER' | 'EIGHT_SEATER' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="FOUR_SEATER">4-Seater</option>
                  <option value="EIGHT_SEATER">8-Seater</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (£) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Add'} Fare
                </button>
              </div>
            </form>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
          </motion.div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowAddForm(true)}
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors flex items-center mb-8"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Fare
          </motion.button>
        )}

        {/* Fares Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {fares.map((fare) => (
                  <tr key={fare.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {fare.fromLocation} → {fare.toLocation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {fare.vehicleType === 'FOUR_SEATER' ? '4-Seater' : '8-Seater'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        £{fare.price}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        fare.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}>
                        {fare.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(fare)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(fare.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {fares.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No fares found</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}