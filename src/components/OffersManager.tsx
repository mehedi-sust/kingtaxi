'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Percent,
  X,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  category: string;
}

export default function OffersManager() {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: 1,
      title: 'Summer Discount',
      description: 'Get 15% off on all rides during summer season',
      discount: 15,
      discountType: 'percentage',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      isActive: true,
      createdAt: '2024-05-15',
      category: 'seasonal'
    },
    {
      id: 2,
      title: 'Christmas Holiday Offer',
      description: '£5 off on airport transfers during Christmas holidays',
      discount: 5,
      discountType: 'fixed',
      startDate: '2024-12-20',
      endDate: '2024-01-05',
      isActive: false,
      createdAt: '2024-11-01',
      category: 'holiday'
    },
    {
      id: 3,
      title: 'New Customer Welcome',
      description: '20% discount for first-time customers',
      discount: 20,
      discountType: 'percentage',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: true,
      createdAt: '2024-01-01',
      category: 'welcome'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    startDate: '',
    endDate: '',
    category: 'general'
  });

  const predefinedOffers = [
    { title: 'Summer Discount', description: 'Seasonal summer offer', discount: 15, category: 'seasonal' },
    { title: 'Christmas Holiday Offer', description: 'Christmas and New Year special', discount: 10, category: 'holiday' },
    { title: 'Easter Special', description: 'Easter holiday discount', discount: 12, category: 'holiday' },
    { title: 'Back to School', description: 'September school runs discount', discount: 8, category: 'seasonal' },
    { title: 'Black Friday Deal', description: 'Black Friday weekend special', discount: 25, category: 'special' },
    { title: 'New Year Resolution', description: 'January fitness center rides', discount: 20, category: 'special' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateOffer = () => {
    const newOffer: Offer = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      discount: parseFloat(formData.discount),
      discountType: formData.discountType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      category: formData.category
    };

    setOffers(prev => [...prev, newOffer]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount.toString(),
      discountType: offer.discountType,
      startDate: offer.startDate,
      endDate: offer.endDate,
      category: offer.category
    });
    setShowCreateModal(true);
  };

  const handleUpdateOffer = () => {
    if (!editingOffer) return;

    const updatedOffer: Offer = {
      ...editingOffer,
      title: formData.title,
      description: formData.description,
      discount: parseFloat(formData.discount),
      discountType: formData.discountType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      category: formData.category
    };

    setOffers(prev => prev.map(offer => 
      offer.id === editingOffer.id ? updatedOffer : offer
    ));
    setShowCreateModal(false);
    setEditingOffer(null);
    resetForm();
  };

  const toggleOfferStatus = (id: number) => {
    setOffers(prev => prev.map(offer => 
      offer.id === id ? { ...offer, isActive: !offer.isActive } : offer
    ));
  };

  const deleteOffer = (id: number) => {
    setOffers(prev => prev.filter(offer => offer.id !== id));
  };


  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount: '',
      discountType: 'percentage',
      startDate: '',
      endDate: '',
      category: 'general'
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(offers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOffers = offers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Offers & Promotions</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage promotional offers and vacation banners</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{offers.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Offers</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{offers.filter(o => o.isActive).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Active Offers</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600">{offers.filter(o => !o.isActive).length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Inactive Offers</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(offers.reduce((acc, offer) => acc + offer.discount, 0) / offers.length) || 0}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Avg. Discount</div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentOffers.map((offer) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{offer.title}</h3>
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                  {offer.category}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleOfferStatus(offer.id)}
                  className={`p-1 rounded ${offer.isActive ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {offer.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEditOffer(offer)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteOffer(offer.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{offer.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Percent className="w-4 h-4 mr-2" />
                {offer.discount}{offer.discountType === 'percentage' ? '%' : '£'} discount
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4 mr-2" />
                {offer.startDate} - {offer.endDate}
              </div>
            </div>

            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              offer.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                offer.isActive ? 'bg-green-500' : 'bg-gray-500'
              }`}></div>
              {offer.isActive ? 'Active' : 'Inactive'}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {offers.length > itemsPerPage && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(endIndex, offers.length)} of {offers.length} offers
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === page
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                </h3>
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingOffer(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Predefined Offers */}
              {!editingOffer && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Start Templates</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {predefinedOffers.map((predefined, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setFormData({
                            title: predefined.title,
                            description: predefined.description,
                            discount: predefined.discount.toString(),
                            discountType: 'percentage',
                            startDate: new Date().toISOString().split('T')[0],
                            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            category: predefined.category
                          });
                        }}
                        className="text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200"
                      >
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{predefined.title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{predefined.discount}% discount</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter offer title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your offer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount Amount *
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Discount Type *
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (£)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                  >
                    <option value="general">General</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="holiday">Holiday</option>
                    <option value="special">Special Event</option>
                    <option value="welcome">Welcome Offer</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingOffer(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editingOffer ? handleUpdateOffer : handleCreateOffer}
                  disabled={!formData.title || !formData.description || !formData.discount || !formData.startDate || !formData.endDate}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
