'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Edit } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrderPage({ params }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('customer');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        governorate: '',
        neighborhood: '',
        centerArea: '',
        quantity: 1,
        buyType: '',
        shippingType: '',
        preferredContactMethod: '',
        deliveryInstructions: '',
        message: ''
    });
    const router = useRouter();

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/orders/${params.orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch order');
            }
            const data = await response.json();

            if (data.status !== 'Pending') {
                router.push('/');
                return;
            }

            setOrder(data);
            setFormData({
                name: data.customerDetails.name || '',
                phone: data.customerDetails.phone || '',
                email: data.customerDetails.email || '',
                governorate: data.customerDetails.governorate || '',
                neighborhood: data.customerDetails.neighborhood || '',
                centerArea: data.customerDetails.centerArea || '',
                buyType: data.customerDetails.buyType || '',
                shippingType: data.customerDetails.shippingType || '',
                preferredContactMethod: data.customerDetails.preferredContactMethod || '',
                deliveryInstructions: data.customerDetails.deliveryInstructions || '',
                message: data.customerDetails.message || '',
                quantity: 1
            });
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('حدث خطأ في تحميل الطلب');
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [params.orderId, router]);

    const handleUpdateCustomerDetails = async () => {
        if (!order) return;
        setIsUpdating(true);

        try {
            const response = await fetch(`/api/orders/${params.orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...order,
                    status: order.status || 'Pending',
                    // orderDate: order.orderDate,
                    orderDate: Date.now(),
                    customerDetails: {
                        ...order.customerDetails,
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email,
                        governorate: formData.governorate || order.customerDetails.governorate,
                        neighborhood: formData.neighborhood,
                        centerArea: formData.centerArea,
                        buyType: formData.buyType,
                        shippingType: formData.shippingType,
                        preferredContactMethod: formData.preferredContactMethod,
                        deliveryInstructions: formData.deliveryInstructions,
                        message: formData.message,
                        userId: order.customerDetails.userId || ''
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update customer details');
            }

            await fetchOrder();
            toast.success('تم تحديث بيانات العميل بنجاح');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating customer details:', error);
            toast.error('حدث خطأ أثناء تحديث بيانات العميل');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateItemQuantity = async () => {
        if (!order || !selectedItem) return;
        setIsUpdating(true);

        try {
            const updatedItems = order.orderItems.map(item => {
                if (item.productId === selectedItem.productId) {
                    return {
                        ...item,
                        quantity: parseInt(formData.quantity)
                    };
                }
                return item;
            });

            const newTotalPrice = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

            const updatedOrder = {
                ...order,
                status: order.status || 'Pending',
                // orderDate: order.orderDate,
                orderDate: Date.now(),
                orderItems: updatedItems,
                totalPrice: newTotalPrice,
                customerDetails: order.customerDetails
            };

            const response = await fetch(`/api/orders/${params.orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedOrder),
            });

            if (!response.ok) {
                throw new Error('Failed to update item quantity');
            }

            await fetchOrder();
            toast.success('تم تحديث الكمية بنجاح');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating item quantity:', error);
            toast.error('حدث خطأ أثناء تحديث الكمية');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner/>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amazon-light-gray to-white">
            {/* Header Section */}
            <div className="bg-amazon relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amazon-yellow/10 via-amazon-orange/10 to-amazon-blue/10"></div>
                <div className="container mx-auto px-4 py-8 sm:py-10 relative">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <h1 className="text-2xl sm:text-4xl font-bold text-white direction-rtl px-2">
                            تفاصيل الطلب{" "}
                            <span className="text-amazon-yellow">{order._id}</span>
                        </h1>
                        <div className="text-amazon-light-gray flex items-center gap-2 flex-wrap justify-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-amazon-orange"></span>
                            تاريخ الطلب: {new Date(order.orderDate).toLocaleDateString('ar-EG')}
                            <span className="inline-block w-2 h-2 rounded-full bg-amazon-orange"></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-amazon-light-gray">
                    <div className="p-4 sm:p-6 md:p-8">
                        {/* Customer Details Section */}
                        <div className="mb-8 sm:mb-12">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                <button
                                    onClick={() => {
                                        setModalMode('customer');
                                        setIsModalOpen(true);
                                    }}
                                    className="bg-amazon-blue hover:opacity-90 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                                >
                                    <Edit className="h-5 w-5" />
                                    تعديل البيانات الأساسية
                                </button>
                                <h3 className="text-xl sm:text-2xl font-bold text-amazon">البيانات الشخصية</h3>
                            </div>
                            <div className="bg-gradient-to-br from-amazon-light-gray/30 to-white p-4 sm:p-6 rounded-xl shadow-sm space-y-3 direction-rtl border border-amazon-light-gray">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-amazon">الاسم:</span>
                                            <span className="text-amazon-dark-gray">{order.customerDetails.name}</span>
                                        </p>
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-amazon">الهاتف:</span>
                                            <span className="text-amazon-dark-gray">{order.customerDetails.phone}</span>
                                        </p>
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-amazon">البريد الإلكتروني:</span>
                                            <span className="text-amazon-dark-gray">{order.customerDetails.email || 'غير متوفر'}</span>
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-amazon">المحافظة:</span>
                                            <span className="text-amazon-dark-gray">{order.customerDetails.governorate}</span>
                                        </p>
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-amazon">المنطقة:</span>
                                            <span className="text-amazon-dark-gray">{order.customerDetails.neighborhood}</span>
                                        </p>
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-amazon">العنوان:</span>
                                            <span className="text-amazon-dark-gray">{order.customerDetails.centerArea}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-amazon-light-gray mt-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-amazon">طريقة التواصل:</span>
                                            <span className="px-3 py-1 bg-amazon-blue/10 text-amazon-blue rounded-full text-sm">
                                                {order.customerDetails.preferredContactMethod}
                                            </span>
                                        </p>
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-amazon">طريقة الشحن:</span>
                                            <span className="px-3 py-1 bg-amazon-orange/10 text-amazon-orange-dark rounded-full text-sm">
                                                {order.customerDetails.shippingType}
                                            </span>
                                        </p>
                                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                            <span className="font-semibold text-amazon">طريقة الدفع:</span>
                                            <span className="px-3 py-1 bg-amazon-yellow/20 text-amazon rounded-full text-sm">
                                                {order.customerDetails.buyType}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                {(order.customerDetails.deliveryInstructions || order.customerDetails.message) && (
                                    <div className="pt-4 border-t border-amazon-light-gray mt-4 space-y-3">
                                        {order.customerDetails.deliveryInstructions && (
                                            <p className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                                <span className="font-semibold text-amazon">تعليمات التوصيل:</span>
                                                <span className="text-amazon-dark-gray">{order.customerDetails.deliveryInstructions}</span>
                                            </p>
                                        )}
                                        {order.customerDetails.message && (
                                            <p className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                                <span className="font-semibold text-amazon">رسالة إضافية:</span>
                                                <span className="text-amazon-dark-gray">{order.customerDetails.message}</span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Items Section */}
                        <div className="mb-8 sm:mb-12">
                            <h3 className="text-xl sm:text-2xl font-bold text-amazon mb-6 direction-rtl">المنتجات المطلوبة</h3>
                            <div className="space-y-4">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="bg-gradient-to-br from-amazon-light-gray/30 to-white p-4 sm:p-6 rounded-xl shadow-sm border border-amazon-light-gray flex flex-col sm:flex-row items-center justify-between gap-4 transform transition-all duration-200 hover:shadow-md">
                                        <button
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setFormData({
                                                    ...formData,
                                                    quantity: item.quantity
                                                });
                                                setModalMode('item');
                                                setIsModalOpen(true);
                                            }}
                                            className="bg-amazon-orange hover:bg-amazon-orange-dark text-white px-4 py-2 rounded-xl flex items-center gap-2 transform transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                                        >
                                            <Edit className="h-4 w-4" />
                                            تعديل الكمية
                                        </button>
                                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                            <div className="text-center sm:text-right space-y-2 order-2 sm:order-1">
                                                <p className="text-lg font-bold text-amazon">{item.title}</p>
                                                <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                                                    <p className="text-sm text-amazon-dark-gray bg-amazon-light-gray px-3 py-1 rounded-full">
                                                        الكمية: {item.quantity}
                                                    </p>
                                                    <p className="text-sm text-amazon-dark-gray bg-amazon-light-gray px-3 py-1 rounded-full">
                                                        السعر: {item.price.toFixed(2)} ج.م
                                                    </p>
                                                </div>
                                                <p className="text-lg font-semibold text-amazon-orange">
                                                    الإجمالي: {(item.price * item.quantity).toFixed(2)} ج.م
                                                </p>
                                            </div>
                                            <img
                                                src={item.selectedImages?.[0]?.startsWith('/') ? item.selectedImages[0] : `/${item.selectedImages[0]}`}
                                                alt={item.title}
                                                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl shadow-md order-1 sm:order-2"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary Section */}
                        <div className="border-t border-amazon-light-gray pt-6">
                            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                                <div className="flex gap-4 w-full sm:w-auto">
                                    <button
                                        onClick={() => router.push('/')}
                                        className="bg-amazon hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition duration-200 hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto"
                                    >
                                        العودة للرئيسية
                                    </button>
                                </div>
                                <div className="text-center sm:text-right bg-gradient-to-r from-amazon-yellow/10 to-white p-4 rounded-xl border border-amazon-yellow w-full sm:w-auto">
                                    <p className="text-xl sm:text-2xl font-bold text-amazon-orange">
                                        الإجمالي: {order.totalPrice.toFixed(2)} ج.م
                                    </p>
                                    <p className="text-sm text-amazon-dark-gray mt-1">
                                        شامل مصاريف الشحن
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-amazon bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-[32rem] ">
                        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-right text-amazon">
                            {modalMode === 'customer' ? 'تعديل البيانات الأساسية' : 'تعديل كمية المنتج'}
                        </h2>

                        {modalMode === 'customer' ? (
                            <div className="space-y-4 h-64 overflow-y-auto">
                                <div>
                                    <label className="block text-amazon mb-2 text-right">الاسم</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">الهاتف</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">المحافظة</label>
                                    <input
                                        type="text"
                                        value={formData.governorate}
                                        onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">المنطقة</label>
                                    <input
                                        type="text"
                                        value={formData.neighborhood}
                                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">العنوان</label>
                                    <textarea
                                        value={formData.centerArea}
                                        onChange={(e) => setFormData({ ...formData, centerArea: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                        rows="2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">طريقة التواصل المفضلة</label>
                                    <select
                                        value={formData.preferredContactMethod}
                                        onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                    >
                                        <option value="واتساب">واتساب</option>
                                        <option value="اتصال">اتصال</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">طريقة الشحن</label>
                                    <select
                                        value={formData.shippingType}
                                        onChange={(e) => setFormData({ ...formData, shippingType: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                    >
                                        <option value="شحن سريع">شحن سريع</option>
                                        <option value="شحن عادي">شحن عادي</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">طريقة الدفع</label>
                                    <select
                                        value={formData.buyType}
                                        onChange={(e) => setFormData({ ...formData, buyType: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                    >
                                        <option value="عند الاستلام">عند الاستلام</option>
                                        <option value="تحويل بنكي">تحويل بنكي</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">تعليمات التوصيل</label>
                                    <textarea
                                        value={formData.deliveryInstructions}
                                        onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                        rows="2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-amazon mb-2 text-right">رسالة إضافية</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                        rows="2"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-amazon mb-2 text-right">الكمية</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full p-3 border border-amazon-light-gray rounded-xl text-right focus:ring-2 focus:ring-amazon-yellow focus:border-amazon-yellow transition-all duration-200"
                                />
                            </div>
                        )}

                        <div className="flex justify-start gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-amazon-dark-gray text-white rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
                                disabled={isUpdating}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={modalMode === 'customer' ? handleUpdateCustomerDetails : handleUpdateItemQuantity}
                                className="px-6 py-3 bg-amazon-orange text-white rounded-xl hover:bg-amazon-orange-dark transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg w-full sm:w-auto"
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 