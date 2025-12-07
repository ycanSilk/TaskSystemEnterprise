'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 后端API返回的数据格式定义
interface TransactionRecord {
  orderNo: string;
  transactionType: string;
  typeDescription: string;
  amount: number;
  beforeBalance: number;
  afterBalance: number;
  status: string;
  statusDescription: string;
  description: string;
  channel: string;
  createTime: string;
  updateTime: string;
}

interface TransactionRecordResponse {
  code: number;
  message: string;
  data: {
    list: TransactionRecord[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

// 前端使用的交易详情类型
interface TransactionDetail {
  id: string;
  type: string;
  typeDescription: string;
  amount: number;
  balanceAfter: number;
  datetime: string;
  description: string;
  orderId?: string;
  status: string;
  statusDescription: string;
  otherParty?: string;
  remark?: string;
  transactionNumber?: string;
  channel?: string;
}

const TransactionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string || '';
  const [transactionDetail, setTransactionDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取交易详情数据
  useEffect(() => {
    const fetchTransactionDetail = async () => {
      try {
        setLoading(true);
        
        // 调用后端API获取交易详情
        const response = await fetch('/api/walletmanagement/transactionrecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: 1,
            size: 100
          }),
        });
        
        console.log('获取交易详情响应:', response.status);
        if (!response.ok) {
          throw new Error('获取交易详情失败');
        }
        
        const data: TransactionRecordResponse = await response.json();
        console.log('获取交易详情响应数据:', data);
        if (data.code === 200 && data.data.list.length > 0) {
          // 从返回的列表中找到与当前ID匹配的交易记录
          // 注意：这里假设orderNo就是前端使用的transactionId
          const matchedTransaction = data.data.list.find(item => item.orderNo === transactionId);
          
          if (matchedTransaction) {
            // 转换后端数据为前端需要的格式
            const transactionDetail: TransactionDetail = {
              id: matchedTransaction.orderNo,
              type: matchedTransaction.transactionType,
              typeDescription: matchedTransaction.typeDescription,
              amount: matchedTransaction.amount,
              balanceAfter: matchedTransaction.afterBalance,
              datetime: matchedTransaction.createTime,
              description: matchedTransaction.description,
              orderId: matchedTransaction.orderNo,
              status: matchedTransaction.status,
              statusDescription: matchedTransaction.statusDescription,
              otherParty: matchedTransaction.channel || '-',
              remark: matchedTransaction.description || '-',
              transactionNumber: matchedTransaction.orderNo,
              channel: matchedTransaction.channel
            };
            
            setTransactionDetail(transactionDetail);
          } else {
            console.error('未找到匹配的交易记录');
            setTransactionDetail(null);
          }
        } else if (data.code === 200 && data.data.list.length === 0) {
          console.error('未找到交易记录列表');
          setTransactionDetail(null);
        } else {
          console.error('获取交易详情失败:', data.message);
          setTransactionDetail(null);
        }
      } catch (error) {
        console.error('获取交易详情失败:', error);
        setTransactionDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [transactionId]);

  // 获取交易类型对应的中文名称
  const getTransactionTypeText = (type: string): string => {
    // 使用后端返回的typeDescription
    return transactionDetail?.typeDescription || type;
  };

  // 获取收支类型对应的中文名称
  const getIncomeExpenseType = (amount: number): string => {
    return amount > 0 ? '收入' : '支出';
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4 text-center">
          <div className="text-5xl mb-3">⏳</div>
          <h3 className="text-lg font-medium text-gray-800">加载中...</h3>
        </div>
      </div>
    );
  }

  if (!transactionDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4 text-center">
          <div className="text-5xl mb-3">❌</div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">交易不存在</h3>
          <p className=" text-sm mb-4">未找到对应的交易记录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center px-4 py-3">
          <h1 className="text-lg font-medium">交易详情</h1>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="px-4 py-4">
        <Card className="shadow-sm border-0 rounded-xl">
          <div className="py-6 px-2">
            {/* 交易类型图标和名称 */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-amber-200 flex items-center justify-center mb-3">
                <span className="text-4xl text-amber-500">¥</span>
              </div>
              <h2 className="">
                {getTransactionTypeText(transactionDetail.type)}
              </h2>
            </div>

            {/* 交易金额 */}
            <div className="flex justify-center mb-10">
              <span className={`text-3xl font-bold ${transactionDetail.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transactionDetail.amount > 0 ? '+' : ''}{transactionDetail.amount.toFixed(2)}
              </span>
            </div>

            {/* 交易信息列表 */}
            <div className="space-y-4">
              {/* 支付时间 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">支付时间</span>
                <span className="">{transactionDetail.datetime}</span>
              </div>

              {/* 交易类型 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">交易类型</span>
                <span className="">
                  {getIncomeExpenseType(transactionDetail.amount)}
                </span>
              </div>

              {/* 交易号 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">交易号</span>
                <span className="">
                  {transactionDetail.transactionNumber || '-'}</span>
              </div>

              {/* 交易状态 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">交易状态</span>
                <span className="">
                  {transactionDetail.statusDescription || '-'}</span>
              </div>

              {/* 支付渠道 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">支付渠道</span>
                <span className="">
                  {transactionDetail.channel || '-'}</span>
              </div>

              {/* 备注 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="">备注</span>
                <span className="">
                  {transactionDetail.remark || '-'}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetailPage;