'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WalletOutlined } from '@ant-design/icons';
import AlertModal from '@/components/ui/AlertModal';

// 定义交易记录详情类型接口
interface TransactionDetail {
  id: string;
  type: string;
  amount: number;
  status: string;
  method: string;
  time: string;
  orderId: string;
  description: string;
  // 额外的详情字段
  transactionId?: string;
  paymentMethod?: string;
  currency?: string;
  ipAddress?: string;
  orderTime?: string;
  completedTime?: string;
  relatedId?: string;
  expenseType?: string;
  balanceAfterTransaction?: number;
  // 自定义字段配置
  customFields?: Array<{
    label: string;
    value: string | React.ReactNode;
    show?: boolean;
    className?: string;
  }>;
}

// 直接在页面中定义交易详情组件
const TransactionDetailComponent: React.FC<{
  transaction: TransactionDetail | null;
  loading: boolean;
  showAlertModal: boolean;
  alertConfig: {
    title: string;
    message: string;
    icon: string;
  };
  onAlertClose: () => void;
  title?: string;
  cardClassName?: string;
  showAmountSection?: boolean;
  showDetailsSection?: boolean;
}> = ({
  transaction,
  loading,
  showAlertModal,
  alertConfig,
  onAlertClose,
  title = '充值详情',
  cardClassName = '',
  showAmountSection = true,
  showDetailsSection = true
}) => {
  // 获取交易类型文本
  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'RECHARGE':
        return '充值';
      default:
        return type;
    }
  };

  // 获取支付方式文本
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'ALIPAY':
        return '支付宝';
      case 'USDT':
        return 'USDT';
      default:
        return method;
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return '成功';
      case 'pending':
        return '处理中';
      case 'failed':
        return '失败';
      default:
        return status;
    }
  };

  // 获取状态颜色类
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // 获取金额颜色类
  const getAmountColorClass = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 渲染交易不存在状态
  if (!transaction) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex flex-col text-center">
        交易记录不存在
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col">
      {/* 顶部导航和标题 */}
      <div className="flex items-center mb-8">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>

      {/* 交易详情卡片 */}
      <div className={`bg-white rounded-lg shadow-md overflow-hidden mb-6 ${cardClassName}`}>
        {/* 金额区域 */}
        {showAmountSection && (
          <div className="p-8 flex flex-col items-center justify-center border-b">
            <h2 className="text-lg  w-1/4 text-center mb-2">{getTransactionTypeText(transaction.type)}</h2>
            <div className={`text-4xl font-bold ${getAmountColorClass(transaction.amount)}`}>
              {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        )}

        {/* 详情信息区域 */}
        {showDetailsSection && (
          <div className="py-2 px-4">
            <div className="space-y-4">
              <div className="flex pb-3 border-b">
                <span className="w-1/4">交易时间</span>
                <span className="w-3/4  text-right">{transaction.time || transaction.completedTime || '未知'}</span>
              </div>
              <div className="flex pb-3 border-b">
                <span className="w-1/4">交易类型</span>
                <span className="w-3/4  text-right">{getTransactionTypeText(transaction.type)}</span>
              </div>
             <div className="flex pb-3 border-b">
                <span className="w-1/4">支付方式</span>
                <span className="w-3/4  text-right">{getPaymentMethodText(transaction.method || transaction.paymentMethod || '未知')}</span>
              </div>
              <div className="flex pb-3 border-b">
                <span className=" w-1/4">交易编号</span>
                <span className="w-3/4  text-right">{transaction.orderId || transaction.id}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        onClose={onAlertClose}
      />
    </div>
  );
};

export default function RechargeDetailPage() {
  const params = useParams();
  const id = params?.id as string || '';
  const router = useRouter();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });

  // 显示通用提示框
  const showAlert = (title: string, message: string, icon: string) => {
    setAlertConfig({ title, message, icon });
    setShowAlertModal(true);
  };

  // 处理提示框关闭
  const handleAlertClose = () => {
    setShowAlertModal(false);
  };

  // 获取交易详情 - 调用后端API获取数据
  const fetchTransactionDetail = async () => {
    try {
      setLoading(true);

      // 调用后端API获取交易记录
      const response = await fetch('/api/walletmanagement/transactionrecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 1,
          size: 100, // 获取足够多的记录以确保能找到目标记录
          transactionType: 'RECHARGE'
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 兼容不同API响应结构
        const rawTransactions = result.data?.list || result.data || result.list || [];
        const allTransactions = Array.isArray(rawTransactions) ? rawTransactions : [];
               // 查找匹配ID的交易记录
        const foundTransaction = allTransactions.find((record: any) => 
          (record.orderNo || record.id) === id && 
          (record.transactionType === 'RECHARGE' || record.type === 'RECHARGE')
        );
        
        if (foundTransaction) {
          // 转换为详情页需要的格式
          const transaction: TransactionDetail = {
            id: foundTransaction.orderNo || foundTransaction.id,
            type: foundTransaction.transactionType || foundTransaction.type || 'RECHARGE',
            amount: parseFloat(foundTransaction.amount) || 0,
            status: foundTransaction.status || 'RECHARGE',
            method: foundTransaction.channel || foundTransaction.method || 'ALIPAY',
            time: foundTransaction.createTime || foundTransaction.time || new Date().toISOString(),
            orderId: foundTransaction.orderNo || foundTransaction.id,
            description: foundTransaction.remark || '',
            balanceAfterTransaction: parseFloat(foundTransaction.balanceAfter) || 0
          };
          setTransaction(transaction);
        } else {
          setTransaction(null);
        }
      } else {
        showAlert('获取失败', result.message || '网络错误，请稍后重试', '❌');
        setTransaction(null);
      }

    } catch (error) {
      showAlert('获取失败', '网络错误，请稍后重试', '❌');
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取交易详情
  useEffect(() => {
    fetchTransactionDetail();
    
    // 延迟清除localStorage中的数据，确保页面已经渲染完成
    // 或者在确认不再需要时再清除
  }, [id]);



  // 直接使用本地定义的组件渲染页面
  return (
    <TransactionDetailComponent
      transaction={transaction}
      loading={loading}
      showAlertModal={showAlertModal}
      alertConfig={alertConfig}
      onAlertClose={handleAlertClose}
      title="充值详情"
      showAmountSection={true}
      showDetailsSection={true}
    />
  );
}