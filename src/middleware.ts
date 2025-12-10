import { NextRequest, NextResponse } from 'next/server';
import { decryptRoute, isEncryptedRoute, encryptRoute } from './lib/routeEncryption';

// 需要加密的一级路由列表（包含所有页面路由）
const encryptableRoutes = ['publisher', 'accountrental'];

export function middleware(request: NextRequest) {
  console.log('[中间件] 处理请求:', request.method, request.url);
  const { pathname, search } = request.nextUrl;
  console.log('[中间件] 路径名:', pathname, '查询参数:', search);
  const pathParts = pathname.split('/').filter(Boolean);
  console.log('[中间件] 路径部分:', pathParts);

  // 检查是否需要解密（如果第一部分是加密的）
  if (pathParts.length > 0 && isEncryptedRoute(pathParts[0])) {
    console.log('[中间件] 检测到加密路由。尝试解密:', pathParts[0]);
    try {
      // 解密路由
      const decryptedPath = decryptRoute(pathParts[0]);
      console.log('[中间件] 解密后的路径:', decryptedPath);
      const decryptedParts = decryptedPath.split('/').filter(Boolean);
      console.log('[中间件] 解密后的路径部分:', decryptedParts);
      
      // 构建新的路径
      const remainingPath = pathParts.slice(1).join('/');
      console.log('[中间件] 剩余路径:', remainingPath);
      const newPath = `/${decryptedParts.join('/')}${remainingPath ? `/${remainingPath}` : ''}`;
      console.log('[中间件] 解密后的新路径:', newPath);
      
      // 创建新的URL
      const newUrl = new URL(request.nextUrl.origin + newPath + search);
      console.log('[中间件] 重写到:', newUrl.href);
      
      // 返回重定向到解密后的路由
      return NextResponse.rewrite(newUrl);
    } catch (error) {
      console.error('[中间件] 路由解密失败:', error);
      // 如果解密失败，继续处理
      console.log('[中间件] 解密失败，继续处理原始请求');
      return NextResponse.next();
    }
  }

  // 检查是否需要加密（如果路径至少有两级，且不是已加密的路由）
  if (pathParts.length >= 2 && !isEncryptedRoute(pathParts[0])) {
    console.log('[中间件] 检测到可加密路由:', pathParts[0]);
    // 检查请求头，避免无限重定向
    const isFromMiddleware = request.headers.get('x-from-middleware') === '1';
    console.log('[中间件] 是否来自中间件:', isFromMiddleware);
    
    if (!isFromMiddleware) {
      try {
        // 如果是一级路由，不加密
        if (pathParts.length === 1) {
          console.log('[中间件] 一级路由，不需要加密');
          return NextResponse.next();
        }
        
        // 加密前两级路由
        const firstTwoLevels = `/${pathParts[0]}/${pathParts[1]}`;
        console.log('[中间件] 加密前两级路由:', firstTwoLevels);
        const encrypted = encryptRoute(firstTwoLevels);
        console.log('[中间件] 加密结果:', encrypted);
        
        // 构建新的路径
        const remainingPath = pathParts.slice(2).join('/');
        console.log('[中间件] 剩余路径:', remainingPath);
        const newPath = `/${encrypted}${remainingPath ? `/${remainingPath}` : ''}`;
        console.log('[中间件] 加密后的新路径:', newPath);
        
        // 创建新的URL
        const newUrl = new URL(request.nextUrl.origin + newPath + search);
        console.log('[中间件] 重定向到加密URL:', newUrl.href);
        
        // 返回重定向到加密后的路由
        const response = NextResponse.redirect(newUrl);
        response.headers.set('x-from-middleware', '1');
        console.log('[中间件] 设置x-from-middleware头为1');
        return response;
      } catch (error) {
        console.error('[中间件] 路由加密失败:', error);
        // 如果加密失败，继续处理
        console.log('[中间件] 加密失败，继续处理原始请求');
        return NextResponse.next();
      }
    }
  }

  // 如果不需要加密或解密，继续处理请求
  console.log('[中间件] 不需要加密或解密，继续处理原始请求');
  return NextResponse.next();
}

// 定义中间件的匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，但排除：
     * 1. 静态文件（/_next/static, /_next/image, /favicon.ico）
     * 2. API路由
     * 3. public目录下的静态资源（images, database, software, uploads）
     */
    '/((?!_next/static|_next/image|favicon.ico|api|images|database|software|uploads).*)',
  ],
};
