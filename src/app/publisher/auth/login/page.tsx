'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PublisherLoginPage() {
  console.log('[PublisherLoginPage] 组件初始化');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    captcha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const router = useRouter();
  
  // 生成随机验证码
  function generateCaptcha(length = 4) {
    console.log('[PublisherLoginPage] generateCaptcha called with length:', length);
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('[PublisherLoginPage] generateCaptcha result:', result);
    return result;
  }

  // 刷新验证码
  const refreshCaptcha = () => {
    console.log('[PublisherLoginPage] refreshCaptcha 被调用');
    setCaptchaCode(generateCaptcha());
    setFormData(prev => ({ ...prev, captcha: '' }));
    console.log('[PublisherLoginPage] refreshCaptcha 完成');
  };

  // 只在客户端生成验证码，避免SSR和客户端渲染不匹配
  useEffect(() => {
    console.log('[PublisherLoginPage] useEffect (验证码初始化) 被调用');
    setCaptchaCode(generateCaptcha());
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    console.log('[PublisherLoginPage] handleSubmit 被调用');
    e.preventDefault();
    setErrorMessage('');
    
    // 增强表单校验
    console.log('[PublisherLoginPage] 表单验证开始');
    // 用户名校验
    if (!formData.username || formData.username.trim() === '') {
      console.log('[PublisherLoginPage] 验证失败: 用户名为空');
      setErrorMessage('请输入用户名');
      return;
    }
    
    // 密码校验
    if (!formData.password || formData.password.trim() === '') {
      console.log('[PublisherLoginPage] 验证失败: 密码为空');
      setErrorMessage('请输入密码');
      return;
    }
    
    // 验证码非空校验
    if (!formData.captcha || formData.captcha.trim() === '') {
      console.log('[PublisherLoginPage] 验证失败: 验证码为空');
      setErrorMessage('请输入验证码');
      return;
    }
    
    // 验证码一致性校验（忽略大小写）
    if (formData.captcha.toUpperCase() !== captchaCode.toUpperCase()) {
      console.log('[PublisherLoginPage] 验证失败: 验证码不匹配。输入:', formData.captcha, '期望:', captchaCode);
      setErrorMessage('验证码错误');
      refreshCaptcha(); // 验证码错误时刷新
      return;
    }
    
    console.log('[PublisherLoginPage] 表单验证通过。提交登录请求');
    setIsLoading(true);
    
    try {
      // 调用后端API进行身份验证
      console.log('[PublisherLoginPage] 调用登录API，用户名:', formData.username);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password.trim()
        }),
        credentials: 'include' // 确保携带cookie
      });
      
      console.log('[PublisherLoginPage] 登录API响应接收。状态:', response.status);
      // 解析响应数据
      const result = await response.json();
      console.log('[PublisherLoginPage] 登录API响应数据:', result);
      
      if (response.ok) {
        // 请求成功（状态码200）
        if (result.success) {
          console.log('[PublisherLoginPage] 登录成功。重定向到仪表盘');
          router.push('/publisher/dashboard');
        } else {
          console.log('[PublisherLoginPage] 登录失败（API返回success: false）。消息:', result.message);
          setErrorMessage(result.message || '登录失败，请检查输入信息');
          refreshCaptcha();
        }
      } else {
        let errorMsg = '';    
        switch (response.status) {
          case 400:
            errorMsg = result.message || '请求参数错误，请检查输入';
            break;
          case 401:
            errorMsg = result.message || '用户名或密码错误';
            break;
          default:
            errorMsg = result.message || `登录失败，状态码: ${response.status}`;
        }
        
        console.log('[PublisherLoginPage] 登录失败，状态:', response.status, '错误:', errorMsg);
        setErrorMessage(errorMsg);
        // 错误时刷新验证码
        refreshCaptcha();
      }
      
    } catch (error) {
      // 网络错误或其他异常
      console.error('[PublisherLoginPage] 登录请求错误:', error);
      setErrorMessage('网络连接失败，请检查网络设置后重试');
      // 错误时刷新验证码
      refreshCaptcha();
    } finally {
      setIsLoading(false);
      console.log('[PublisherLoginPage] handleSubmit 完成');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部装饰 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 pt-12 pb-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-white font-bold text-4xl mb-3">
            微任务系统平台
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 -mt-8">
        <div className="max-w-md mx-auto px-4">
          {/* 登录卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">登录</h2>
            </div>

            {/* 登录表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 用户名输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  placeholder="请输入用户名"
                  value={formData.username}
                  onChange={(e) => {
                    console.log('[PublisherLoginPage] 用户名更改为:', e.target.value);
                    setFormData({...formData, username: e.target.value});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 密码输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => {
                    console.log('[PublisherLoginPage] 密码已更改（出于安全考虑未记录值）');
                    setFormData({...formData, password: e.target.value});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* 验证码输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="请输入验证码"
                    value={formData.captcha}
                    onChange={(e) => {
                      console.log('[PublisherLoginPage] 验证码更改为:', e.target.value);
                      setFormData({...formData, captcha: e.target.value});
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div 
                    className="w-24 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg font-bold text-lg cursor-pointer"
                    onClick={refreshCaptcha}
                  >
                    {captchaCode}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">点击验证码可刷新</p>
              </div>

              {/* 错误信息 */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">⚠️</span>
                    <span className="text-sm text-red-700">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
           
            </form>

            {/* 注册提示 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有账户？{' '}
                <button 
                  onClick={() => {
                    console.log('[PublisherLoginPage] 注册按钮被点击');
                    router.push('/publisher/auth/register');
                  }}
                  className="text-blue-500 hover:underline"
                >
                  立即注册
                </button>
                <button 
                  onClick={() => {
                    console.log('[PublisherLoginPage] 忘记密码按钮被点击');
                    router.push('/publisher/auth/resetpwd');
                  }}
                  className="text-blue-500 hover:underline ml-3"
                >
                  忘记密码
                </button>
              </p>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="text-center mb-8">
            <p>©2025 微任务系统平台 V1.0</p>
          </div>
        </div>
        
        {/* 登录成功后将直接跳转 */}
      </div>
    </div>
  );
}